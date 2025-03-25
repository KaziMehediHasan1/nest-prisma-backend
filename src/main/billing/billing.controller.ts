import { Body, Controller, Post } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreatePaymentIntentDto } from './dto/createPayment.dto';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Post('create-payment-session')
    async createPaymentSession(@Body() payment: CreatePaymentIntentDto) {
        return this.billingService.createPaymentSession(payment);
    }
}
