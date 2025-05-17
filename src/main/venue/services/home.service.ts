import { Injectable } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/interfaces/response';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class HomeService {
  constructor(private readonly db: DbService) {}

  async getHomeData(id: string) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    // 1. Countdown Event — nearest upcoming booking (by selectedDate)
    const countdownEvent = await this.db.booking.findFirst({
      where: {
        selectedDate: { gte: startOfDay },
        bookedById: id,
      },
      orderBy: {
        selectedDate: 'asc',
      },
      include: {
        venue: {
          include: {
            venueImage: {
              select: {
                path: true,
              },
            },
          },
        },
      },
    });

    // 2. Featured Venues
    const featuredVenues = await this.db.venue.findMany({
      where: {
        verified: true,
      },
      take: 5,
      include: {
        venueImage: true,
      },
    });

    // 3. Upcoming Events — future bookings
    const upcomingEvents = await this.db.booking.findMany({
      where: {
        selectedDate: { gte: startOfDay },
        bookedById: id,
      },
      orderBy: {
        selectedDate: 'asc',
      },
      take: 5,
      include: {
        venue: {
          include: {
            venueImage: true,
          },
        },
      },
    });

    // 4. Event Services
    const eventServices = await this.db.serviceProviderType.findMany();

    return {
      countdownEvent,
      featuredVenues,
      upcomingEvents,
      eventServices,
    };
  }

  async getVenueByIdByPlanner({ id }: IdDto): Promise<ApiResponse<any>> {
    const [venue, averageRating, totalReviews] = await this.db.$transaction([
      this.db.venue.findUnique({
        where: { id },
        select: {
          name: true,
          area: true,
          capacity: true,
          decoration: true,
          venueImage: {
            select: { path: true },
          },
          reviews: {
            take: 3,
            orderBy: { createdAt: 'desc' }, // latest 3 reviews
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              Profile: {
                select: {
                  id: true,
                  name: true,
                  image: {
                    select: {
                      path: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.db.review.aggregate({
        where: { venueId: id },
        _avg: {
          rating: true,
        },
      }),
      this.db.review.count({
        where: { venueId: id },
      }),
    ]);

    return {
      data: {
        ...venue,
        averageRating: averageRating._avg.rating,
        totalReviews,
      },
      message: 'Venue fetched successfully',
      statusCode: 200,
      success: true,
    };
  }
}
