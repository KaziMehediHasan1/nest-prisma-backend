import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { IdDto } from 'src/common/dto/id.dto';

export class SetPriceDto extends IdDto {
  @ApiProperty({ description: 'Total amount for the booking', default: 0 })
  @IsInt()
  @Min(0)
  totalAmount: number;
}
