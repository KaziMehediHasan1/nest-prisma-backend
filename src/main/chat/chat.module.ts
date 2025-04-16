import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';
import { ChatController } from './chat.controller';

@Module({
  providers: [ChatGateway, ChatService, JwtService],
  controllers: [ChatController],
})
export class ChatModule {}
