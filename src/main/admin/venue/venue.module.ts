import { Module } from '@nestjs/common';
import { VenueController } from './venue.controller';
import { GetAllVenueService } from './services/get-all-venue.service';

@Module({
  controllers: [VenueController],
  providers: [GetAllVenueService]
})
export class VenueModule {}
