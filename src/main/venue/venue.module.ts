import { Module } from '@nestjs/common';
import { VenueService } from './services/venue.service';
import { VenueController } from './venue.controller';

import { VenueRevenueService } from './services/venue-revenue.service';
import { BookingService } from '../booking/services/booking.service';
import { HomeService } from './services/home.service';
import { FilterService } from './services/filter.service';
import { VenueOwnerService } from './services/venueOwner.service';

@Module({
  controllers: [VenueController],
  providers: [
    VenueService,
    FilterService,
    VenueRevenueService,
    BookingService,
    HomeService,
    VenueOwnerService,
  ],
})
export class VenueModule {}
