import { Module } from '@nestjs/common';
import { EventPreferenceService } from './event-preference.service';
import { EventPreferenceController } from './event-preference.controller';

@Module({
  controllers: [EventPreferenceController],
  providers: [EventPreferenceService],
})
export class EventPreferenceModule {}
