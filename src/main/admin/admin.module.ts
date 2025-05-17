import { Module } from '@nestjs/common';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserModule } from './user/user.module';
import { VenueModule } from './venue/venue.module';

@Module({
  imports: [AnalyticsModule, UserModule, VenueModule]
})
export class AdminModule {}
