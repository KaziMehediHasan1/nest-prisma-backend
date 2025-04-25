import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsValidPhone } from 'src/validators/phone.validator';

export class CreateGuestDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name cannot be longer than 50 characters' })
  name: string;

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, Anytown, CA 90210',
  })
  @IsString({ message: 'Address must be a string' })
  @MaxLength(200, { message: 'Address cannot be longer than 200 characters' })
  location: string;

  @ApiProperty({
    description: 'User phone number with country code',
    example: '+1 212 555 4567',
  })
  @IsValidPhone('ANY', {
    message: 'Invalid phone number or country code',
  })
  phone: string;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;
}
