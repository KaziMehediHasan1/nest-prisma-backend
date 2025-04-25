import { Module } from '@nestjs/common';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { FilterService } from './filter.service';

@Module({
  controllers: [VenueController],
  providers: [VenueService, FilterService],
})
export class VenueModule {}
