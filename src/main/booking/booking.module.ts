import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { AmenitiesModule } from './amenities/amenities.module';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [AmenitiesModule],
})
export class BookingModule {}
