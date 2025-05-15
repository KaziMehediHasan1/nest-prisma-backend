import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateServiceProviderTypeDto {
  @ApiProperty({
    description: 'The name of the event preference',
    example: 'Tech Conferences',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  avatar: Express.Multer.File;
}
