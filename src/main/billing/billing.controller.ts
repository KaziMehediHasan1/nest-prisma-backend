import { Body, Controller, Post } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreatePaymentIntentDtoWithId } from './dto/createPayment.dto';
import Stripe from 'stripe';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Post('create-payment-session')
    async createPaymentSession(@Body() payment: CreatePaymentIntentDtoWithId) {
        return this.billingService.createCheckoutSession(payment);
    }

    @Post('webhook')
    async handleCheckoutSessionCompleted(@Body() session: Stripe.Event) {
        this.billingService.handleStripeEvent(session);
    }

    @Post('create-payment-intent')
    async createPaymentIntent(@Body() payment: CreatePaymentIntentDtoWithId) {
        return this.billingService.createPaymentIntent(payment);
    }
}
