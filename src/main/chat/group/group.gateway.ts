import { WebSocketGateway } from '@nestjs/websockets';
import { GroupService } from './group.service';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  path: '/group-chat',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class GroupGateway {
  constructor(private readonly groupService: GroupService) {}

  

}
