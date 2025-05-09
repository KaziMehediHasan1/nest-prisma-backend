import { Module } from '@nestjs/common';
import { ChatListService } from './chat-list.service';
import { ChatListGateway } from './chat-list.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [ChatListGateway, ChatListService, JwtService],
})
export class ChatListModule {}
