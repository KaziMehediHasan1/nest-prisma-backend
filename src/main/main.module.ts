import { Module } from '@nestjs/common';
import { BillingModule } from './billing/billing.module';
import { AuthModule } from './auth/auth.module';
import { EventPreferenceModule } from './event-preference/event-preference.module';
import { VenueModule } from './venue/venue.module';
import { ReviewModule } from './review/review.module';
import { BookingModule } from './booking/booking.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [BillingModule, AuthModule, EventPreferenceModule, VenueModule, ReviewModule, BookingModule, ChatModule],
})
export class MainModule {}
