import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkShowCaseDto {
  @ApiProperty({
    description: 'ID of the event type (optional)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  eventTypeId?: string;

  @ApiProperty({ description: 'Title of the project' })
  @IsString()
  projectTitle: string;

  @ApiProperty({ description: 'Description of the work' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Uploaded files (e.g., images, PDFs)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  files: Express.Multer.File[];

}
