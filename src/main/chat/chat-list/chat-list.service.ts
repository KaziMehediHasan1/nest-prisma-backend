import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class ChatListService {
  constructor(private readonly db: DbService) {}

  public async getChatsList(userId: string, take = 20, cursor?: Date) {
    // 1. Fetch Conversations where the user is a member
    const conversations = await this.db.conversation.findMany({
        where: {
          OR: [{ memberOneId: userId }, { memberTwoId: userId }],
        },
        include: {
          lasMessage: {
            select:{
                content: true,
                id: true,
                createdAt: true
            }
          },
          memberOne: {
            select: {
              id: true,
              name: true,
              image:{
                select:{
                    path:true
                }
              }
            }
          },
          memberTwo: {
            select: {
              id: true,
              name: true,
              image:{
                select:{
                    path:true
                }
              }
            }
          },
        },
      });
      
      const groupMessages = await this.db.groupMessage.findMany({
        where: {
          profiles: {
            some: { id: userId },
          },
        },
        include: {
          lastMessage:{
            select: {
              content: true,
              id: true,
              createdAt: true
            }
          },
          profiles: {
            select: {
              id: true,
              name: true,
              image: {
                select: {
                  path: true,
                },
              },
            },
          },
        },
      });
      
      let allChats = [
        ...conversations.map((c) => ({
          type: 'conversation' as const,
          id: c.id,
          lastMessageDate: c.lasMessage?.createdAt ?? new Date(0),
          data: c,
        })),
        ...groupMessages.map((g) => ({
          type: 'group' as const,
          id: g.id,
          lastMessageDate: g.lastMessage?.createdAt ?? new Date(0),
          data: g,
        })),
      ];
      
      allChats.sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());
      
      // Apply cursor-based pagination
      if (cursor) {
        allChats = allChats.filter(chat => chat.lastMessageDate < cursor);
      }
      
      const paginated = allChats.slice(0, take);
      
      return paginated;
      
  }
}
