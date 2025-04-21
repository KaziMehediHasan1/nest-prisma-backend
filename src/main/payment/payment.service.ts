import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class PaymentService {
  constructor(private readonly dbService: DbService) {}

  async getCashInListForVenue(userId: string, { skip, take }: PaginationDto) {
    return this.dbService.payment.findMany({
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
  }
}
