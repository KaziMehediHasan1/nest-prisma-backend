// dto/resetPassword.dto.ts
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'New password for the account',
    example: 'Password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}
