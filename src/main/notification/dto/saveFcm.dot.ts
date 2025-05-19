// src/fcm-token/dto/create-fcm-token.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveFcmTokenDto {
  @ApiProperty({
    description: 'FCM device token',
    example: 'dLzL_w3vQ8KcQ1SaKJWnhr:APA91bGLT...'
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
