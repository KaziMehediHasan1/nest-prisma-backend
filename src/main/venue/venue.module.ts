import { Module } from '@nestjs/common';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { FilterService } from './filter.service';
import { VenueRevenueService } from './venue-revenue.service';
import { BookingService } from '../booking/booking.service';
import { HomeService } from './home.service';

@Module({
  controllers: [VenueController],
  providers: [VenueService, FilterService, VenueRevenueService, BookingService, HomeService],
})
export class VenueModule {}
