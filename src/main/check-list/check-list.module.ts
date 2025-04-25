import { Module } from '@nestjs/common';
import { CheckListService } from './check-list.service';
import { CheckListController } from './check-list.controller';

@Module({
  controllers: [CheckListController],
  providers: [CheckListService],
})
export class CheckListModule {}
