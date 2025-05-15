import { Module } from '@nestjs/common';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AnalyticsModule, UserModule]
})
export class AdminModule {}
