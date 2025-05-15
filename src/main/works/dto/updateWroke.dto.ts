import {
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkShowCaseDto {
  @ApiProperty({
    description: 'ID of the event type (optional)',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  eventTypeId?: string;

  @ApiProperty({ 
    description: 'Title of the project',
    required: false,
  })
  @IsOptional()
  @IsString()
  projectTitle?: string;

  @ApiProperty({ 
    description: 'Description of the work',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Uploaded files (e.g., images, PDFs)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  @IsOptional()
  files?: Express.Multer.File[];
}