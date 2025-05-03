// dto/resetPassword.dto.ts
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeOnlyDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Verification code sent to the user\'s email',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  code: string;

}