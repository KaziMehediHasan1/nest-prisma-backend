import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { FilterVenuesDto } from './dto/filterVenue.dto';
import { Prisma } from '@prisma/client';
import { ApiResponse } from 'src/interfaces/response';

@Injectable()
export class FilterService {
  constructor(private readonly db: DbService) {}

  public async FilterVenues(filter: FilterVenuesDto):Promise<ApiResponse<any>> {
    const {
      city,
      area,
      minCapacity,
      maxCapacity,
      minPrice,
      maxPrice,
      type,
      bookingType,
      verified,
      startDate,
      endDate,
      minRating,
    } = filter;

    let bookedDates: Date[] = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        bookedDates.push(new Date(d));
      }
    }

    const where: Prisma.VenueWhereInput = {
        ...(city && { city }),
        ...(area && { area }),
        ...(minCapacity || maxCapacity ? {
          capacity: {
            ...(minCapacity && { gte: minCapacity }),
            ...(maxCapacity && { lte: maxCapacity }),
          },
        } : {}),
        ...(minPrice || maxPrice ? {
          price: {
            ...(minPrice && { gte: minPrice }),
            ...(maxPrice && { lte: maxPrice }),
          },
        } : {}),
        ...(type && { type }),
        ...(bookingType && { bookingType }),
        ...(typeof verified === 'boolean' && { verified }),
        ...(bookedDates.length > 0 ? {
          NOT: {
            bookedDates: {
              hasSome: bookedDates,
            },
          },
        } : {}),
        ...(minRating ? {
          reviews: {
            some: {
              rating: {
                gte: minRating,
              },
            },
          },
        } : {}),
      };
  
      const data = await this.db.venue.findMany({
        where,
        include: {
          reviews: true,
          decoration: true,
          arrangementsImage: true,
          shifts: true,
        },
      });

      return {
        data,
        message: 'Venues fetched successfully',
        statusCode: 200,
        success: true
      }
  }
}
