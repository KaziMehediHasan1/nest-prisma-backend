import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiResponse } from 'src/interfaces/response';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class GetBookingService {
  constructor(private readonly db: DbService) {}

  public async getBookingStatus(
    { take, skip }: PaginationDto,
    status: $Enums.BookingStatus,
    { id: venueId }: IdDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.db.booking.findMany({
      where: {
        bookingStatus: status,
        venueId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
      select: {
        eventName: true,
        selectedDate: true,
        venue:{
            select:{
                name:true,
                venueImage: { select: { path: true } },
            }
        },
        startTime: true,
        bookingStatus: true,
      },
    });

    return {
      data,
      message: 'success',
      statusCode: 200,
      success: true,
    };
  }
}
