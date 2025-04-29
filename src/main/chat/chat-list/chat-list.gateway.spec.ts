import { Test, TestingModule } from '@nestjs/testing';
import { ChatListGateway } from './chat-list.gateway';
import { ChatListService } from './chat-list.service';

describe('ChatListGateway', () => {
  let gateway: ChatListGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatListGateway, ChatListService],
    }).compile();

    gateway = module.get<ChatListGateway>(ChatListGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
