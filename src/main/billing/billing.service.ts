import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentIntentDtoWithId } from './dto/createPayment.dto';
import { DbService } from 'src/lib/db/db.service';
import { $Enums } from '@prisma/client';
import { ApiResponse } from 'src/interfaces/response';
import { log } from 'console';

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
    console.log(paymentIntent.id);

    const { type, id, userId } = metadata;

    this.logger.log(`PaymentIntent succeeded. Type: ${type}, ID: ${id}`);

    switch (type) {
      case 'booking':
        try {
          return this.handleBookingPayment(
            id,
            paymentIntent.amount_received / 100,
            paymentIntent.id,
          );
        } catch (error) {
          this.logger.error(error);
        }
      case 'fullPayment':
        try {
          return this.handleFullPayment(
            id,
            paymentIntent.amount_received / 100,
            paymentIntent.id,
          );
        } catch (error) {
          this.logger.error(error);
        }
      case 'verificationFee':
        try {
          return this.handleVerificationFee(
            userId,
            paymentIntent.amount_received / 100,
            paymentIntent.id,
          );
        } catch (error) {
          this.logger.error(error);
        }
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
        try {
          return this.handleBookingPayment(id);
        } catch (error) {
          this.logger.error(error);
        }
      case 'fullPayment':
        try {
          return this.handleFullPayment(id);
        } catch (error) {
          this.logger.error(error);
        }
      case 'verificationFee':
        try {
          return this.handleVerificationFee(id);
        } catch (error) {
          this.logger.error(error);
        }
      default:
        this.logger.warn(`Unknown CheckoutSession type: ${type}`);
    }
  }

  private async handleBookingPayment(
    id: string,
    amount?: number,
    paymentIntentId?: string,
  ) {
    this.logger.log(`Handling booking payment for ID: ${id}`);

    if (!amount) {
      this.logger.warn('Amount not found');
      return;
    }

    const booking = await this.db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      this.logger.error(`Booking not found for ID: ${id}`);
      return;
    }

    if (
      (booking.accept === $Enums.AcceptanceStatus.DENIED &&
        booking.totalAmount === 0) ||
      booking.bookingStatus === $Enums.BookingStatus.CONFIRMED
    ) {
      this.logger.error(
        `Booking is not accepted by the venue owner for ID: ${id}`,
      );
      return;
    }

    try {
      await this.db.booking.update({
        where: { id: booking.id },
        data: {
          paid: booking.paid + amount,
          due: booking.due - amount,
          bookingStatus: 'CONFIRMED',
          payment: {
            create: {
              amount: amount,
              paymentMethod: 'CREDIT_CARD',
              paymentStatus: 'COMPLETED',
              paymentIntentId,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error updating booking for ID: ${id}`, error);
      return;
    }
  }

  private async handleFullPayment(
    id: string,
    amount?: number,
    paymentIntentId?: string,
  ) {
    this.logger.log(`Handling full payment for ID: ${id}`);

    if (!amount) {
      this.logger.warn('Amount not found');
      return;
    }

    const booking = await this.db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      this.logger.error(`Booking not found for ID: ${id}`);
      return;
    }

    if (
      (booking.accept === $Enums.AcceptanceStatus.DENIED &&
        booking.totalAmount === 0) ||
      booking.bookingStatus === $Enums.BookingStatus.COMPLETED
    ) {
      this.logger.error(
        `Booking is not accepted by the venue owner for ID: ${id}`,
      );
      return;
    }

    try {
      await this.db.booking.update({
        where: { id: booking.id },
        data: {
          paid: booking.paid + amount,
          due: 0,
          bookingStatus: 'COMPLETED',
          payment: {
            create: {
              amount: amount,
              paymentMethod: 'CREDIT_CARD',
              paymentStatus: 'COMPLETED',
              paymentIntentId,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error updating booking for ID: ${id}`, error);
      return;
    }
  }

  private async handleVerificationFee(
    id: string,
    amount?: number,
    paymentIntentId?: string,
  ) {
    this.logger.log(`Handling service booking for ID: ${id}`);
    // TODO: Implement logic
    if (!amount) {
      this.logger.warn('Amount not found');
      return;
    }

    const isSubmissionExist = await this.db.verificationSubmission.findFirst({
      where: {
        profile: {
          id,
        },
      },
    });

    if (!isSubmissionExist) {
      this.logger.error(`Submission not found for ID: ${id}`);
      return;
    }

    const user = await this.db.profile.findUnique({
      where: {
        id,
        user: {
          role: {
            hasSome: ['VENUE_OWNER', 'SERVICE_PROVIDER'],
          },
        },
      },
      include: {
        user: true,
      },
    });

    if (!user) {
      this.logger.error(`User not found for ID: ${id}`);
      return;
    }

    await this.db.user.update({
      where: { id: user.user.id },
      data: {
        isVerified: true,
        profile: {
          update: {
            isPro: true,
            VerificationSubmission: {
              update: {
                where: {
                  id: isSubmissionExist.id,
                },
                data: {
                  payment: {
                    create: {
                      amount,
                      paymentMethod: 'CREDIT_CARD',
                      paymentStatus: 'COMPLETED',
                      paymentIntentId,
                    },
                  },
                },
              },
            },
            venues: {
              updateMany: {
                where: { profileId: user.id },
                data: { verified: true },
              },
            },
          },
        },
      },
    });
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

  public async createPaymentIntent({
    currency,
    email,
    amount,
    id,
    paymentType,
    userId,
  }: CreatePaymentIntentDtoWithId): Promise<ApiResponse<any>> {
    try {
      let customer;
      // Check if the customer exists in Stripe
      customer = await this.stripe.customers.list({ email });

      if (customer.data.length === 0) {
        // If customer doesn't exist, create a new one
        customer = await this.stripe.customers.create({ email });
      } else {
        // If customer exists, retrieve the first customer
        customer = customer.data[0];
      }

      // Now use the customer's Stripe ID
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        customer: customer.id, // Use the customer's Stripe ID
        metadata: {
          id,
          type: paymentType,
          userId,
        },
      });

      const paymentIntentInfo = await this.stripe.paymentIntents.retrieve(
        paymentIntent.id,
      );

      this.logger.log(paymentIntentInfo);

      return {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
        },
        statusCode: 200,
        message: 'Payment intent created successfully',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
