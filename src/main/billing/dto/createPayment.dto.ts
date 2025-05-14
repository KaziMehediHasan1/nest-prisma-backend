import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export enum PaymentType {
  BOOKING = 'booking',
  FULL_PAYMENT = 'fullPayment',
  VERIFICATION_FEE = 'verificationFee',
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
  @ApiPropertyOptional({
    description: 'Unique identifier (UUID) of a venue or service provider',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID('4', { message: 'ID must be a valid UUID (version 4).' })
  @IsOptional()
  id: string;

  @ApiPropertyOptional({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID must be a valid UUID (version 4).' })
  userId: string;

  @ApiProperty({
    description: 'Type of payment being made',
    enum: PaymentType,
    example: PaymentType.BOOKING,
  })
  @IsEnum(PaymentType, { message: 'paymentType must be a valid enum value' })
  paymentType: PaymentType;

}
