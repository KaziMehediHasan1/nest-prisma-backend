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
}
