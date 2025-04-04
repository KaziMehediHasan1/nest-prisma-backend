import { Module } from '@nestjs/common';
import { BillingModule } from './billing/billing.module';
import { AuthModule } from './auth/auth.module';
import { EventPreferenceModule } from './event-preference/event-preference.module';

@Module({
  imports: [BillingModule, AuthModule, EventPreferenceModule]
})
export class MainModule {}
