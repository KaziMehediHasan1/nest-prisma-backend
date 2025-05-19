import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateVenueDto } from '../dto/venueCreate.dto';
import { FileInstance } from '@prisma/client';
import { UploadService } from 'src/lib/upload/upload.service';
import { EventService } from 'src/lib/event/event.service';
import { UpdateVenueDto } from '../dto/updateVenue.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/interfaces/response';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { VenueRevenueService } from './venue-revenue.service';
import { BookingService } from '../../booking/services/booking.service';
import { IdsDto } from 'src/common/dto/ids.sto';

@Injectable()
export class VenueOwnerService {
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
    private readonly eventEmitter: EventService,
    private readonly venueRevenueService: VenueRevenueService,
    private readonly bookingService: BookingService,
  ) {}

  // getAll venue by venue owner start==============================

  public async getAllVenuesByVenueOwner({
    pagination: { skip, take },
    profileId: { id },
  }: {
    pagination: PaginationDto;
    profileId: IdDto;
  }): Promise<ApiResponse<any>> {
    // Step 1: Get venues
    const venues = await this.db.venue.findMany({
      where: { profileId: id },
      include: {
        venueImage: { select: { path: true } },
      },
      take,
      skip,
    });

    // Step 2: For each venue, compute average rating
    const venuesWithRatings = await Promise.all(
      venues.map(async (venue) => {
        const avgResult = await this.db.review.aggregate({
          _avg: { rating: true },
          where: {
            Venue: {
              id: venue.id,
            },
          },
        });

        return {
          ...venue,
          averageRating: avgResult._avg.rating ?? 0,
        };
      }),
    );

    return {
      data: venuesWithRatings,
      message: 'Venues fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  async getVenueOwnerOverviewAnalytics(userId: string) {
    const venueProfiles = await this.db.venue.findMany({
      where: {
        Profile: {
          id: userId,
        },
      },
      select: {
        id: true,
      },
    });

    const venueIds = venueProfiles.map((v) => v.id);

    if (venueIds.length === 0) {
      return {
        totalRevenue: 0,
        currentMonthRevenue: 0,
        previousMonthRevenue: 0,
        growthRate: 'N/A',
        totalPendingBookings: 0,
        totalVenues: 0,
      };
    }

    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const startOfPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const endOfPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    );

    const [totalRevenueAgg, currentMonthAgg, previousMonthAgg, pendingCount] =
      await Promise.all([
        this.db.booking.aggregate({
          where: { venueId: { in: venueIds } },
          _sum: { totalAmount: true },
        }),
        this.db.booking.aggregate({
          where: {
            venueId: { in: venueIds },
            createdAt: { gte: startOfMonth },
          },
          _sum: { totalAmount: true },
        }),
        this.db.booking.aggregate({
          where: {
            venueId: { in: venueIds },
            createdAt: {
              gte: startOfPrevMonth,
              lte: endOfPrevMonth,
            },
          },
          _sum: { totalAmount: true },
        }),
        this.db.booking.count({
          where: {
            venueId: { in: venueIds },
            bookingStatus: 'PENDING',
          },
        }),
      ]);

    const totalRevenue = totalRevenueAgg._sum.totalAmount ?? 0;
    const currentRevenue = currentMonthAgg._sum.totalAmount ?? 0;
    const prevRevenue = previousMonthAgg._sum.totalAmount ?? 0;

    const growthRate =
      prevRevenue > 0
        ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
        : null;

    return {
      totalRevenue,
      currentMonthRevenue: currentRevenue,
      previousMonthRevenue: prevRevenue,
      growthRate: growthRate !== null ? +growthRate.toFixed(2) : 'N/A',
      totalPendingBookings: pendingCount,
      totalVenues: venueIds.length,
    };
  }

  async getThreeUpcomingEvents(id: string) {
    const today = new Date();
    console.log(today);

    const bookings = await this.db.booking.findMany({
      where: {
        selectedDate: {
          gte: today,
        },
        venue: {
          profileId: id,
        },
      },
      orderBy: {
        selectedDate: 'asc',
      },
      take: 3,
      include: {
        venue: {
          select: {
            name: true,
            area: true,
            venueImage: { select: { path: true } },
          },
        },
      },
    });

    return bookings;
  }

  async getRecentVenueReviews(id: string) {
    return this.db.review.findMany({
      where: {
        Venue: {
          profileId: id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
      include: {
        Profile: {
          select: {
            name: true,
            image: {
              select: {
                path: true,
              },
            },
          },
        },
      },
    });
  }

  async getOverviewOfVenueOwnerHome(id: string): Promise<ApiResponse<any>> {
    const analytics = await this.getVenueOwnerOverviewAnalytics(id);
    const upcomingEvents = await this.getThreeUpcomingEvents(id);
    const recentReviews = await this.getRecentVenueReviews(id);
    return {
      data: {
        analytics,
        upcomingEvents,
        recentReviews,
      },
      message: 'Overview fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  // getAll venue by venue owner end==============================

  async getVenueForComparison({ ids }: IdsDto): Promise<ApiResponse<any>> {
    const venues = await this.db.venue.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        venueImage: { select: { path: true } },
        decoration: true,
      },
    });
    return {
      data: venues,
      message: 'Venues fetched successfully',
      statusCode: 200,
      success: true,
    };
  }
}
