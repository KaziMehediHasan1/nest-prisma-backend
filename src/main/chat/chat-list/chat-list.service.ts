import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class ChatListService {
  constructor(private readonly db: DbService) {}

  public async getChatsList(userId: string) {
    // 1. Fetch Conversations where the user is a member
    const conversations = await this.db.conversation.findMany({
      where: {
        OR: [{ memberOneId: userId }, { memberTwoId: userId }],
      },
      include: {
        lasMessage: true,
        memberOne: true,
        memberTwo: true,
      },
    });

    const groupMessages = await this.db.groupMessage.findMany({
      where: {
        profiles: {
          some: { id: userId },
        },
      },
      include: {
        lastMessage: true, 
        profiles: true,
      },
    });

    const allChats = [
      ...conversations.map((c) => ({
        type: 'conversation',
        id: c.id,
        lastMessageDate: c.lasMessage?.createdAt ?? new Date(0), // fallback if no message
        data: c,
      })),
      ...groupMessages.map((g) => ({
        type: 'group',
        id: g.id,
        lastMessageDate: g.lastMessage?.createdAt ?? new Date(0),
        data: g,
      })),
    ];

    allChats.sort(
      (a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime(),
    );

    return allChats;
  }
}
