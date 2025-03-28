import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsOptional, 
  IsEnum, 
  Matches 
} from 'class-validator';

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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must include uppercase, lowercase, number, and special character'
  })
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
    description: 'User phone number',
    example: '+1234567890'
  })
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({
    description: 'User role',
    enum: $Enums.UserRole,
    required: false,
    example: $Enums.UserRole.PLANNER
  })
  @IsOptional()
  @IsEnum($Enums.UserRole, { message: 'Invalid user role' })
  role?: $Enums.UserRole;
}