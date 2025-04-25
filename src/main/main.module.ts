import { Module } from '@nestjs/common';
import { BillingModule } from './billing/billing.module';
import { AuthModule } from './auth/auth.module';
import { EventPreferenceModule } from './event-preference/event-preference.module';
import { VenueModule } from './venue/venue.module';
import { ReviewModule } from './review/review.module';
import { BookingModule } from './booking/booking.module';
import { ChatModule } from './chat/chat.module';
import { PdfModule } from './pdf/pdf.module';
import { GuestModule } from './guest/guest.module';
import { ShiftModule } from './shift/shift.module';
import { EmployeesModule } from './employees/employees.module';
import { PaymentModule } from './payment/payment.module';
import { NotificationModule } from './notification/notification.module';
import { CheckListModule } from './check-list/check-list.module';
import { ProfileVerificationModule } from './profile-verification/profile-verification.module';

@Module({
  imports: [
    BillingModule,
    AuthModule,
    EventPreferenceModule,
    VenueModule,
    ReviewModule,
    BookingModule,
    ChatModule,
    PdfModule,
    GuestModule,
    ShiftModule,
    EmployeesModule,
    PaymentModule,
    NotificationModule,
    CheckListModule,
    ProfileVerificationModule,
  ],
})
export class MainModule {}
