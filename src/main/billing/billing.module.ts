import { Module } from '@nestjs/common';
import { BillingService } from './services/billing.service';
import { BillingController } from './billing.controller';

@Module({
  providers: [BillingService],
  controllers: [BillingController],
})
export class BillingModule {}
