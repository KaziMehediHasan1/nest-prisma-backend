import { Injectable } from '@nestjs/common';
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
            venueImage: true,
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
}
