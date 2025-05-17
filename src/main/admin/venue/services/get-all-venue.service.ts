import { Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/interfaces/response';
import { DbService } from 'src/lib/db/db.service';
import { GetVenuesDto } from '../dto/getVenue.dto';

@Injectable()
export class GetAllVenueService {
  constructor(private readonly db: DbService) {}

  async getAllVenues({
    skip,
    take,
    status,
  }: GetVenuesDto): Promise<ApiResponse<any>> {
    const where = status ? { status } : undefined;

    const [venues, totalCount] = await this.db.$transaction([
      this.db.venue.findMany({
        skip,
        take,
        where,
        include: {
          venueImage: {
            select: { path: true },
          },
          bookings: {
            select: { totalAmount: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.db.venue.count({ where }),
    ]);

    const formattedVenues = venues.map((venue) => {
      const totalEarning = venue.bookings.reduce(
        (sum, b) => sum + b.totalAmount,
        0,
      );
      const commission = totalEarning * 0.1; // 10%

      return {
        id: venue.id,
        name: venue.name,
        status: venue.status,
        address: venue.area,
        totalEarning,
        commission,
        coverImage: venue.venueImage?.path ?? null,
      };
    });

    return {
      data: {
        venues: formattedVenues,
        totalCount,
      },
      message: 'Venues fetched successfully',
      statusCode: 200,
      success: true,
    };
  }
}
