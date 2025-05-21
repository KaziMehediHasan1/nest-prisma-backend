import { Module } from '@nestjs/common';
import { BookingService } from './services/booking.service';
import { BookingController } from './booking.controller';
import { AmenitiesModule } from './amenities/amenities.module';
import { ServiceProviderService } from './services/service-provider.service';
import { GetBookingService } from './services/get-booking.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, ServiceProviderService, GetBookingService],
  imports: [AmenitiesModule],
})
export class BookingModule {}
