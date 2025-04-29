import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { forwardRef, Inject, Logger, UseFilters } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { ChatListService } from './chat-list.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WebSocketExceptionsFilter } from 'src/error/wsError.filter';
import { IncomingMessage } from 'http';
import { OnEvent } from '@nestjs/event-emitter';
import { ChatListUpdateEvent, EVENT_TYPES } from 'src/interfaces/event';

@UseFilters(new WebSocketExceptionsFilter())
@WebSocketGateway({
  path: '/chat-list',
  cors: {
    origin: '*',
  },
})
export class ChatListGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatListGateway.name);
  private readonly clients: Map<string, Set<WebSocket>> = new Map(); // userId => clients

  constructor(
    @Inject(forwardRef(() => ChatListService))
    private readonly chatListService: ChatListService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server): void {
    this.logger.log('Chat List WebSocket Gateway Initialized');
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
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });

      const userId = decoded.profileId as string;

      if (!userId) {
        throw new WsException('Invalid token payload: missing user ID');
      }

      (client as any).userId = userId;

      this.subscribeClient(userId, client);

      client.on('close', () => {
        this.handleDisconnect(client);
      });

      this.logger.log(`Client connected: ${userId}`);
    } catch (err) {
      this.logger.warn('JWT verification failed');
      client.close();
    }
  }

  handleDisconnect(client: WebSocket): void {
    this.removeClientFromAllUsers(client);
    this.logger.log('Client disconnected from Chat List Gateway');
  }

  private subscribeClient(userId: string, client: WebSocket): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(client);
    this.logger.log(`Client subscribed for user ${userId}`);
  }

  private removeClientFromAllUsers(client: WebSocket): void {
    for (const [userId, clients] of this.clients.entries()) {
      if (clients.has(client)) {
        clients.delete(client);
        this.logger.log(`Client removed from user ${userId} after disconnect`);
      }
    }
  }

  @SubscribeMessage('get_chat_list')
  async handleGetChatList(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() payload: { take?: number; cursor?: string },
  ): Promise<void> {
    const userId = (client as any).userId;
    if (!userId) throw new WsException('User ID not found in client');

    const take = payload?.take ?? 20;
    const cursor = payload?.cursor ? new Date(payload.cursor) : undefined;

    const chatList = await this.chatListService.getChatsList(userId, take, cursor);

    client.send(
      JSON.stringify({
        type: 'chat_list',
        payload: chatList,
      }),
    );
  }

  async broadcastChatListUpdate(userId: string): Promise<void> {
    const clients = this.clients.get(userId);
    if (!clients || clients.size === 0) return;

    const chatList = await this.chatListService.getChatsList(userId, 20); // send latest 20 only

    const message = JSON.stringify({
      type: 'chat_list_update',
      payload: chatList,
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    this.logger.log(
      `Broadcasted chat list update to ${clients.size} clients for user ${userId}`,
    );
  }

  @OnEvent(EVENT_TYPES.CHAT_LIST_UPDATE)
  async handleChatListUpdate(event: ChatListUpdateEvent): Promise<void> {
    await this.broadcastChatListUpdate(event.userId);
  }
}
