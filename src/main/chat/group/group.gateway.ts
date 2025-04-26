import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { GroupService } from './group.service';
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
  path: '/group-chat',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class GroupGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly clients: Map<string, Set<WebSocket>> = new Map();
  private readonly logger = new Logger(GroupGateway.name);

  constructor(
    private readonly groupService: GroupService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server): void {
    this.logger.log('Group WebSocket Gateway Initialized');
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

      client.on('close', () => {
        this.handleDisconnect(client);
      });
    } catch (err) {
      this.logger.warn('JWT verification failed');
      client.close();
    }
  }

  handleDisconnect(client: WebSocket): void {
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
              await this.groupService.findGroupById(conversationId);
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
            const messages = await this.groupService.findMessagesByGroupId({
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
}
