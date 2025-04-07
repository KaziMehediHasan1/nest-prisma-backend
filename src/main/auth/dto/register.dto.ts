import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum
} from 'class-validator';
import { IsValidPhone } from 'src/validators/phone.validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(100, { message: 'Email cannot be longer than 100 characters' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongPass123!',
    minLength: 8,
    maxLength: 50
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password cannot be longer than 50 characters' })
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name cannot be longer than 50 characters' })
  name: string;

  @ApiProperty({
    description: 'User phone number with country code',
    example: '+1 212 555 4567'
  })
  @IsValidPhone("ANY", {
    message: 'Invalid phone number or country code'
  })
  phone: string;

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, Anytown, CA 90210',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(200, { message: 'Address cannot be longer than 200 characters' })
  location: string;

  @ApiProperty({
    description: 'User role',
    enum: $Enums.UserRole,
    required: false,
    example: $Enums.UserRole.PLANNER
  })
  @IsOptional()
  @IsEnum($Enums.UserRole, { message: 'Invalid user role' })
  role?: $Enums.UserRole;

  @ApiProperty({
    description: 'User gender',
    example: $Enums.Gender.MALE,
    enum: $Enums.Gender,
    required: false
  })
  @IsOptional()
  @IsEnum($Enums.Gender, {
    message: 'Gender must be one of: Male, Female, Other, Prefer not to say'
  })
  gender: $Enums.Gender;
}