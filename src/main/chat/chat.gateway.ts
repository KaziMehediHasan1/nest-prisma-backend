import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { ChatService } from './chat.service';
import { IncomingMessage } from 'http';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface ClientMessage {
  conversationId: string;
  type: 'subscribe_to_message' | 'unsubscribe' | 'subscribe_to_messages';
  payload?: {
    type: 'create' | 'update' | 'delete';
    payload: any;
    take: number;
    cursor: string;
  };
}

@WebSocketGateway({
  path: '/chat',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly clients: Map<string, Set<WebSocket>> = new Map();
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: WebSocket, ...args: any[]): void {
    const req = args[0] as IncomingMessage;
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Missing or invalid Authorization header');
      client.close();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwt.verify(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });
      (client as any).user = decoded;

      this.logger.log(`Client connected: ${decoded.sub || 'unknown user'}`);

      client.on('message', (message: string) => {
        this.handleRawMessage(client, message);
      });

      client.on('close', () => {
        this.handleDisconnect(client);
      });
    } catch (err) {
      this.logger.warn('JWT verification failed');
      client.close();
    }
  }

  handleDisconnect(client: WebSocket): void {
    this.removeClientFromAllConversations(client);
    this.logger.log('Client disconnected');
  }

  private async handleRawMessage(
    client: WebSocket,
    message: string,
  ): Promise<void> {
    try {
      const { conversationId, type, payload } = JSON.parse(
        message,
      ) as ClientMessage;

      if (!conversationId || !type) return;

      switch (type) {
        case 'subscribe_to_message':
          const isExist =
            await this.chatService.findConversationById(conversationId);
          if (!isExist) {
            this.logger.error(`Conversation ${conversationId} does not exist`);
            return;
          }
          this.subscribeClient(conversationId, client);
          break;

        case 'unsubscribe':
          this.unsubscribeClient(conversationId, client);
          break;

        case 'subscribe_to_messages':
          if (!payload) {
            this.logger.error('Payload is missing');
            client.send(
              JSON.stringify({
                error: 'Payload is missing',
              }),
            );
            return;
          }
          const messages = await this.chatService.findMessagesByConversationId({
            id: conversationId,
            cursor: payload?.cursor,
            take: payload?.take,
          });
          client.send(JSON.stringify(messages));

        default:
          this.logger.warn(`Unknown message type received: ${type}`);
      }
    } catch (error) {
      this.logger.error('Invalid message format', error);
    }
  }

  private subscribeClient(conversationId: string, client: WebSocket): void {
    if (!this.clients.has(conversationId)) {
      this.clients.set(conversationId, new Set());
    }
    this.clients.get(conversationId)!.add(client);
    this.logger.log(`Client subscribed to ${conversationId}`);
  }

  private unsubscribeClient(conversationId: string, client: WebSocket): void {
    const clients = this.clients.get(conversationId);
    if (clients?.has(client)) {
      clients.delete(client);
      this.logger.log(`Client unsubscribed from ${conversationId}`);
    }
  }

  private removeClientFromAllConversations(client: WebSocket): void {
    for (const clients of this.clients.values()) {
      clients.delete(client);
    }
  }

  broadcastToConversation<T>({
    conversationId,
    type,
    payload,
  }: {
    conversationId: string;
    type: 'create' | 'update' | 'delete';
    payload: T;
  }): void {
    const clients = this.clients.get(conversationId);
    if (!clients) return;

    const message = JSON.stringify({ type, payload });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
