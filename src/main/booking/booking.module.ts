import { Module } from '@nestjs/common';
import { BookingService } from './services/booking.service';
import { BookingController } from './booking.controller';
import { AmenitiesModule } from './amenities/amenities.module';
import { ServiceProviderService } from './services/service-provider.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, ServiceProviderService],
  imports: [AmenitiesModule],
})
export class BookingModule {}
