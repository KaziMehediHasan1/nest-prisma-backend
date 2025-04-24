import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterTaskDto {
  @ApiPropertyOptional({ description: 'Filter tasks by done status' })
  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
