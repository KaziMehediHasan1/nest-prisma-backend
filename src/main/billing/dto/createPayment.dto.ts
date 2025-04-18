import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export enum PaymentType {
  BOOKING = 'booking',
  FULL_PAYMENT = 'fullPayment',
  SERVICE_BOOKING = 'serviceBooking',
}


export class CreatePaymentIntentDto {
  @ApiProperty({
    example: 'usd',
    description: 'Currency in which the payment is made',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Customer email address for the payment',
  })
  @IsString()
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @ApiProperty({
    example: 5000,
    description:
      'Payment amount in smallest currency unit (e.g., cents for USD)',
  })
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;
}

export class CreatePaymentIntentDtoWithId extends CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'ID must be a valid UUID (version 4).' })
  id: string;

  @ApiProperty({
    description: 'Type of payment being made',
    enum: PaymentType,
    example: PaymentType.BOOKING,
  })
  @IsEnum(PaymentType, { message: 'paymentType must be a valid enum value' })
  paymentType: PaymentType;
}
