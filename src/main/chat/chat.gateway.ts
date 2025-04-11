import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { ChatService } from './chat.service';

interface ClientMessage {
  conversationId: string;
  type: 'subscribe' | 'unsubscribe';
}

@WebSocketGateway({
  path: '/chat', 
  cors:{
    origin: '*'}
})
@Injectable()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Map<string, Set<WebSocket>> = new Map();
  private logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: WebSocket, ...args: any[]) {
    this.logger.log('Client connected');
  }

  handleDisconnect(client: WebSocket) {
    // Remove client from all conversation subscriptions
    for (const clients of this.clients.values()) {
      clients.delete(client);
    }
    this.logger.log('Client disconnected');
  }

  @SubscribeMessage('message')
  handleMessage(client: WebSocket, payload: string): void {
    try {
      const data = JSON.parse(payload) as ClientMessage;
      const { conversationId, type } = data;

      if (!conversationId || !type) return;
      console.log(conversationId);
      
      if (type === 'subscribe') {
        if (!this.clients.has(conversationId)) {
          this.clients.set(conversationId, new Set());
        }
        this.clients.get(conversationId)?.add(client);
        this.logger.log(`Client subscribed to ${conversationId}`);
      }

      if (type === 'unsubscribe') {
        this.clients.get(conversationId)?.delete(client);
        this.logger.log(`Client unsubscribed from ${conversationId}`);
      }
    } catch (err) {
      this.logger.error('Invalid message format', err);
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
  }) {
    const clients = this.clients.get(conversationId);
    if (!clients) return;

    const message = JSON.stringify({ type, payload });

    clients.forEach((client) => {
      if ((client as WebSocket).readyState === WebSocket.OPEN) {
        (client as WebSocket).send(message);
      }
    });
  }
}