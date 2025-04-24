import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DbService } from 'src/lib/db/db.service';

@WebSocketGateway({
  path: '/presence',
  cors: { origin: '*' },
})
@Injectable()
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AuthGateway.name);
  private readonly userWatchers: Map<string, Set<WebSocket>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: DbService,
  ) {}

  async handleConnection(client: WebSocket, ...args: any[]) {
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

      const userId = decoded.sub;
      (client as any).userId = userId;

      await this.prisma.profile.updateMany({
        where: { userId },
        data: { active: true },
      });

      this.broadcastUserStatus(userId, true);

      this.logger.log(`User ${userId} marked as active`);

      client.on('message', (msg) => {
        try {
          const data = JSON.parse(msg.toString());
          if (data.type === 'watch_user_status' && data.userId) {
            this.watchUserStatus(client, data.userId);
          }
        } catch (err) {
          this.logger.warn('Invalid JSON received');
        }
      });

    } catch (error) {
      this.logger.warn('JWT verification failed');
      client.close();
    }
  }

  async handleDisconnect(client: WebSocket) {
    const userId = (client as any).userId;

    if (!userId) return;

    await this.prisma.profile.updateMany({
      where: { userId },
      data: { active: false },
    });

    this.broadcastUserStatus(userId, false);
    this.cleanupWatchers(client);

    this.logger.log(`User ${userId} marked as inactive`);
  }

  private watchUserStatus(client: WebSocket, userId: string) {
    if (!this.userWatchers.has(userId)) {
      this.userWatchers.set(userId, new Set());
    }
    this.userWatchers.get(userId)!.add(client);
    this.logger.log(`Client is now watching user ${userId}`);
  }

  private broadcastUserStatus(userId: string, isActive: boolean) {
    const watchers = this.userWatchers.get(userId);
    if (!watchers) return;

    const message = JSON.stringify({
      type: 'user_status',
      payload: { userId, active: isActive },
    });

    watchers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private cleanupWatchers(client: WebSocket) {
    for (const [userId, watchers] of this.userWatchers.entries()) {
      if (watchers.has(client)) {
        watchers.delete(client);
        if (watchers.size === 0) {
          this.userWatchers.delete(userId);
        }
      }
    }
  }
}
