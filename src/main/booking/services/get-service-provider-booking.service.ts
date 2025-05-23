import { BadRequestException, Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { endOfToday, startOfToday } from 'date-fns';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiResponse } from 'src/interfaces/response';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class GetServiceProviderBookingService {
    constructor(
        private readonly db: DbService,
    ) {}

    public async getServiceProviderBookingSummaries({ id: serviceProviderId }: IdDto): Promise<ApiResponse<any>> {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    if (!serviceProviderId) {
      throw new BadRequestException('Service provider ID is required.');
    }

    // 1️⃣ Today's first 3 confirmed bookings for the service provider
    const todaysBookings = await this.db.booking.findMany({
      where: {
        serviceProviderId,
        bookingStatus: 'CONFIRMED',
        selectedDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      select:{
        eventName: true,
        selectedDate: true,
        startTime: true,
      },
    });

    // 2️⃣ Upcoming first 3 confirmed bookings
    const upcomingBookings = await this.db.booking.findMany({
      where: {
        serviceProviderId,
        bookingStatus: 'CONFIRMED',
        selectedDate: {
          gt: todayEnd,
        },
      },
      orderBy: {
        selectedDate: 'asc',
      },
      select:{
        eventName: true,
        selectedDate: true,
        startTime: true,
        EventType:{
          select: {
            name: true,
            avatar:{
              select: {
                path: true,
              }
            }
          }
        }
      },
      take: 3,
    });

    // 3️⃣ First 3 booking requests
    const bookingRequests = await this.db.booking.findMany({
      where: {
        serviceProviderId,
        bookingStatus: 'REQUESTED',
      },
      orderBy: {
        selectedDate: 'asc',
      },
       select:{
        eventName: true,
        selectedDate: true,
        startTime: true,
        EventType:{
          select: {
            name: true,
            avatar:{
              select: {
                path: true,
              }
            }
          }
        }
      },
      take: 3,
    });

    return {
      data: {
        todaysBookings,
        upcomingBookings,
        bookingRequests,
      },
      message: 'Service provider booking summaries fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  public async getBookingStatus(
    { take, skip }: PaginationDto,
    status: $Enums.BookingStatus,
    { id: serviceProviderId }: IdDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.db.booking.findMany({
      where: {
        bookingStatus: status,
        serviceProviderId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
      select: {
        eventName: true,
        selectedDate: true,
        EventType:{
          select: {
            name: true,
            avatar:{
              select: {
                path: true,
              }
            }
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
