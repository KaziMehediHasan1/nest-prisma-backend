import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

/**
 * DTO for code verification requests
 */
export class VerifyCodeDto {
  @ApiProperty({
    description: 'User identifier (email or phone number)',
    example: 'user@example.com',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Identifier is required' })
  identifier: string;

  @ApiProperty({
    description: 'Verification code sent to the user',
    example: '123456',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Verification code is required' })
  @Length(6, 6, { message: 'Verification code must be exactly 6 characters' })
  @Matches(/^[0-9]+$/, { message: 'Verification code must contain only numbers' })
  code: string;
}