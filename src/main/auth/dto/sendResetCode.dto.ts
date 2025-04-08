import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendResetCodeDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
