import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAminityDto {
  @ApiProperty({
    description: 'Name of the amenity',
    example: 'WiFi',
  })
  @IsString()
  name: string;
}
