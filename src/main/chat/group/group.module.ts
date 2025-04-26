import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupGateway } from './group.gateway';
import { GroupController } from './group.controller';

@Module({
  providers: [GroupGateway, GroupService],
  controllers: [GroupController],
})
export class GroupModule {}
