import { Module } from '@nestjs/common';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { FilterService } from './filter.service';
import { VenueRevenueService } from './venue-revenue.service';
import { BookingService } from '../booking/booking.service';

@Module({
  controllers: [VenueController],
  providers: [VenueService, FilterService, VenueRevenueService, BookingService],
})
export class VenueModule {}
