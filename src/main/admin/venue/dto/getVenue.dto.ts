// dto/get-venues.dto.ts
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { VenueStatus } from '@prisma/client'; // Assuming enum is in Prisma
import { ApiProperty } from '@nestjs/swagger';

export class GetVenuesDto extends PaginationDto {
  @ApiProperty({
    required: false,
    enum: VenueStatus,
  })
  @IsOptional()
  @IsEnum(VenueStatus)
  status?: VenueStatus;
}
