import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiResponse } from 'src/interfaces/response';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class PaymentService {
  constructor(private readonly dbService: DbService) {}

  async getCashInListForVenue(userId: string, { skip, take }: PaginationDto):Promise<ApiResponse<any>> {
    const payments = await this.dbService.payment.findMany({
      where: {
        bookingInfo: {
          venue: {
            profileId: userId,
          },
        },
      },
      skip,
      take
    });

    return {
      data: payments,
      message: 'Payments fetched successfully',
      statusCode: 200,
      success: true,
    }
  }
}
