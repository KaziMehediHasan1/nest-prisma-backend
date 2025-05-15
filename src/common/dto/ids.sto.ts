import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class IdsDto {
  @ApiProperty({
    description: 'Array of UUIDs',
    example: ['550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'IDs array should not be empty.' })
  @IsUUID('4', { each: true, message: 'Each ID must be a valid UUID (version 4).' })
  ids: string[];
}