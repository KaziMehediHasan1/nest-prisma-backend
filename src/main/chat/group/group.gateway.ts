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
import { forwardRef, Inject, Injectable, Logger, UseFilters } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { GroupService } from './group.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WebSocketExceptionsFilter } from 'src/error/wsError.filter';

interface SubscriptionData {
  conversationId: string;
}

interface MessagesSubscriptionData extends SubscriptionData {
  payload: {
    take: number;
    cursor?: string;
  };
}

@UseFilters(new WebSocketExceptionsFilter())
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
    @Inject(forwardRef(() => GroupService))
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
    this.removeClientFromAllGroups(client);
    this.logger.log('Client disconnected');
  }

  // NestJS SubscribeMessage decorators for more structured event handling
  @SubscribeMessage('subscribe_to_message')
  async handleSubscribe(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() data: SubscriptionData,
  ): Promise<void> {
    const { conversationId } = data;
    if (!conversationId) {
      this.logger.error('Conversation ID is missing');
      throw new WsException('Conversation ID is missing');
      return;
    }
    const isExist = await this.groupService.findGroupById(conversationId);
    
    if (!isExist) {
      this.logger.error(`Group ${conversationId} does not exist`);
      throw new WsException(`Group ${conversationId} does not exist`);
      return;
    }
    
    this.subscribeClient(conversationId, client);
    client.send(JSON.stringify({ status: 'subscribed', groupId: conversationId }));
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() data: SubscriptionData,
  ): void {
    const { conversationId } = data;
    this.unsubscribeClient(conversationId, client);
    client.send(JSON.stringify({ status: 'unsubscribed', groupId: conversationId }));
  }

  @SubscribeMessage('subscribe_to_messages')
  async handleGetMessages(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() data: MessagesSubscriptionData,
  ): Promise<void> {
    const { conversationId, payload } = data;
    if(!conversationId) {
      this.logger.error('Conversation ID is missing');
      throw new WsException('Conversation ID is missing');
      return;
    }
    if (!payload) {
      this.logger.error('Payload is missing');
      throw new WsException('Payload is missing');
      return;
    }
    
    const messages = await this.groupService.findMessagesByGroupId({
      id: conversationId,
      cursor: payload?.cursor,
      take: payload?.take,
    });
    
    client.send(JSON.stringify(messages));
  }

  private subscribeClient(conversationId: string, client: WebSocket): void {
    if (!this.clients.has(conversationId)) {
      this.clients.set(conversationId, new Set());
    }
    this.clients.get(conversationId)!.add(client);
    this.logger.log(`Client subscribed to group ${conversationId}`);
  }

  private unsubscribeClient(conversationId: string, client: WebSocket): void {
    const clients = this.clients.get(conversationId);
    if (clients?.has(client)) {
      clients.delete(client);
      this.logger.log(`Client unsubscribed from group ${conversationId}`);
    }
  }
  
  private removeClientFromAllGroups(client: WebSocket): void {
    for (const [groupId, clients] of this.clients.entries()) {
      if (clients.has(client)) {
        clients.delete(client);
        this.logger.log(`Client removed from group ${groupId} due to disconnect`);
      }
    }
  }
  
  // Method to broadcast messages to all clients subscribed to a group
  broadcastToGroup<T>({
    groupId,
    type,
    payload,
  }: {
    groupId: string;
    type: 'create' | 'update' | 'delete';
    payload: T;
  }): void {
    const clients = this.clients.get(groupId);
    if (!clients || clients.size === 0) return;

    const message = JSON.stringify({ type, payload });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
    
    this.logger.log(`Broadcasted ${type} event to ${clients.size} clients in group ${groupId}`);
  }
}