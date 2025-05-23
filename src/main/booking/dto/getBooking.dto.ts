import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class GetBookingByStatusDto extends IdDto {
  @ApiProperty({
    enum: $Enums.BookingStatus,
    description: 'The status of the booking',
  })
  @IsEnum($Enums.BookingStatus)
  bookingStatus: $Enums.BookingStatus;
}
