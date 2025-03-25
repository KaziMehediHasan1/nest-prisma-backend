import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsPositive, IsString } from "class-validator";

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
    description: 'Payment amount in smallest currency unit (e.g., cents for USD)',
  })
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;
}
