import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateVerificationRequestDto {
  @ApiProperty({
    description: 'UUID of the first chat member (memberOne)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  profileId: string;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  idCard: Express.Multer.File;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  tradeLicense: Express.Multer.File;

  @ApiProperty({
    description: 'UUID of the first chat member (memberOne)',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsString()   
  bio: string;
}
