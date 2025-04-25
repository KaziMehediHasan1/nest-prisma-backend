import { IsString, IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Task 1' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Event A' })
  @IsString()
  eventName: string;

  @ApiProperty({ example: '2025-04-25T10:00:00.000Z', description: 'Date of the task' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '2025-04-25T15:30:00.000Z', description: 'Time of the task' })
  @IsDateString()
  time: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @ApiPropertyOptional({ example: 'profile-id-uuid' })
  @IsOptional()
  @IsString()
  profileId?: string;
}
