import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dto/createPayment.dto';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-02-24.acacia',
      },
    );
  }

  public async createPaymentSession({
    currency,
    email,
    amount,
  }: CreatePaymentIntentDto) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: { name: 'Sample Product' },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/billing/success',
      cancel_url: 'http://localhost:3000/billing/cancel',
    });

    return {
      url: session.url,
    };
  }
}
