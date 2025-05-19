import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({
    description: 'ID of the venue associated with the shift',
    example: '1c7e5e4a-f5d6-4c89-91c3-b1c937a2aeb9',
  })
  @IsUUID()
  @IsNotEmpty()
  venueId: string;

  @ApiProperty({
    description: 'Start time of the shift in ISO format',
    example: '2025-04-21T09:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time of the shift in ISO format',
    example: '2025-04-21T17:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    description: 'Name or title of the shift',
    example: 'Morning Shift',
  })
  @IsString()
  @IsNotEmpty()
  shiftName: string;

}
