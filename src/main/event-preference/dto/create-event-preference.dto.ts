import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Express } from 'express';

export class CreateEventPreferenceDto {
  @ApiProperty({
    description: 'The name of the event preference',
    example: 'Tech Conferences',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  avatar?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'ID of the profile this preference belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsUUID()
  profileId?: string;
}