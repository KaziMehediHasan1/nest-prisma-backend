import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupGateway } from './group.gateway';
import { GroupController } from './group.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [GroupGateway, GroupService, JwtService],
  controllers: [GroupController],
})
export class GroupModule {}
