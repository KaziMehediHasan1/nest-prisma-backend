import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentIntentDtoWithId } from './dto/createPayment.dto';
import { DbService } from 'src/lib/db/db.service';
import { $Enums, BookingStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly db: DbService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-02-24.acacia',
      },
    );
  }

  private verifyAmount({
    baseAmount,
    received,
  }: {
    baseAmount: number;
    received: number;
  }) {
    switch (true) {
      case baseAmount * 0.1 === received:
        return received;
      case baseAmount === received:
        return baseAmount;
      case baseAmount < received:
        this.logger.error(
          `Received more than expected. Expected: ${baseAmount}, Received: ${received}`,
        );
      default:
        this.logger.error(
          `Received more than expected. Expected: ${baseAmount}, Received: ${received}`,
        );
    }
  }

  /**
   * Creates a Stripe Checkout Session
   */
  public async createCheckoutSession({
    currency,
    email,
    amount,
    id,
    paymentType,
    userId,
  }: CreatePaymentIntentDtoWithId): Promise<{ url: string | null }> {
    const session: Stripe.Checkout.Session =
      await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        customer_email: email,
        expand: ['payment_intent'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: { name: 'Sample Product' },
              unit_amount: amount * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url:
          this.configService.get<string>('STRIPE_SUCCESS_URL') ||
          'http://localhost:3000/billing/success',
        cancel_url:
          this.configService.get<string>('STRIPE_CANCEL_URL') ||
          'http://localhost:3000/billing/cancel',
        payment_intent_data: {
          metadata: {
            type: paymentType,
            id: id,
            userId: userId,
          },
        },
      });

    return { url: session.url };
  }

  /**
   * Handles Stripe checkout.session.completed webhook event
   */
  public async handleStripeEvent(event: Stripe.Event) {
    this.logger.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        return this.handlePaymentIntentSucceeded(event);

      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(event);

      default:
        this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const metadata = paymentIntent.metadata;
    if (!metadata?.type || !metadata?.id) {
      this.logger.warn('Missing metadata in PaymentIntent: type or id');
      return;
    }
    console.log(paymentIntent.amount_received);

    const { type, id, userId } = metadata;

    this.logger.log(`PaymentIntent succeeded. Type: ${type}, ID: ${id}`);

    switch (type) {
      case 'booking':
        return this.handleBookingPayment(
          id,
          paymentIntent.amount_received / 100,
          userId,
        );
      case 'fullPayment':
        return this.handleFullPayment(id);
      case 'serviceBooking':
        return this.handleServiceBooking(id);
      default:
        this.logger.warn(`Unknown PaymentIntent type: ${type}`);
    }
  }

  private async handleCheckoutSessionCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata;
    if (!metadata?.type || !metadata?.id) {
      this.logger.warn('Missing metadata in CheckoutSession: type or id');
      return;
    }

    const { type, id } = metadata;
    this.logger.log(`Checkout session completed. Type: ${type}, ID: ${id}`);

    // Add any specific handling logic for sessions if needed
    switch (type) {
      case 'booking':
        return this.handleBookingPayment(id);
      case 'fullPayment':
        return this.handleFullPayment(id);
      case 'serviceBooking':
        return this.handleServiceBooking(id);
      default:
        this.logger.warn(`Unknown CheckoutSession type: ${type}`);
    }
  }

  private async handleBookingPayment(
    id: string,
    amount?: number,
    userId?: string,
  ) {
    this.logger.log(`Handling booking payment for ID: ${id}`);
    console.log(id, amount, userId);

    if (!amount) {
      this.logger.warn('Amount not found');
      return;
    }

    const booking = await this.db.booking.findUnique({
      where: { id },
    });

    if (!userId) {
      this.logger.error(`User not found for ID: ${id}`);
      return;
    }

    if (!booking) {
      this.logger.error(`Booking not found for ID: ${id}`);
      return;
    }

    if (
     ( booking.accept === $Enums.AcceptanceStatus.DENIED &&
      booking.totalAmount === 0) ||
      booking.bookingStatus === $Enums.BookingStatus.COMPLETED
    ) {
      this.logger.error(
        `Booking is not accepted by the venue owner for ID: ${id}`,
      );
      return;
    }

    const totalAmount = this.verifyAmount({
      baseAmount: booking.due,
      received: amount,
    });

    if (!totalAmount) {
      return;
    }

    try {
      await this.db.booking.update({
        where: { id: booking.id },
        data: {
          paid: booking.paid + totalAmount,
          due: booking.due - totalAmount,
          bookingStatus:
            booking.due === totalAmount ? 'COMPLETED' : 'CONFIRMED',
          payment: {
            create: {
              amount: totalAmount,
              paymentMethod: 'CREDIT_CARD',
              paymentStatus: 'COMPLETED',
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error updating booking for ID: ${id}`, error);
      return;
    }
  }

  private async handleFullPayment(id: string) {
    this.logger.log(`Handling full payment for ID: ${id}`);
    // TODO: Implement logic
  }

  private async handleServiceBooking(id: string) {
    this.logger.log(`Handling service booking for ID: ${id}`);
    // TODO: Implement logic
  }

  /**
   * Used by controller to verify and parse webhook events
   */
  public verifyAndConstructEvent(body: Buffer, sig: string): Stripe.Event {
    const endpointSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    return this.stripe.webhooks.constructEvent(body, sig, endpointSecret);
  }
}
