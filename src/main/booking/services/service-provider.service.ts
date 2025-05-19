import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateServiceProviderBookingDto } from '../dto/serviceProviderBooking.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { differenceInMinutes } from 'date-fns';
import { ApiResponse } from 'src/interfaces/response';


@Injectable()
export class ServiceProviderService {
    constructor(
        private readonly dbService: DbService
    ) {}

   public async createBooking(rawData: CreateServiceProviderBookingDto, { id }: IdDto): Promise<ApiResponse<any>> {
    const {
      date,
      startTime,
      endTime,
      eventTypeId,
      numberOfGuests,
      serviceProviderId,
      eventName,
      plannerName,
      location,
    } = rawData;

    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    if (parsedStart >= parsedEnd) {
      throw new BadRequestException('Start time must be before end time.');
    }

    const duration = differenceInMinutes(parsedEnd, parsedStart);

    // 1️⃣ Check for existing overlapping booking for this user
    const userConflict = await this.dbService.booking.findFirst({
      where: {
        bookedById: id,
        selectedDate: date,
        OR: [
          {
            startTime: {
              lt: parsedEnd,
            },
            endTime: {
              gt: parsedStart,
            },
          },
        ],
      },
    });

    if (userConflict) {
      throw new BadRequestException('You already have a booking that conflicts with this time.');
    }

    // 2️⃣ Check for overlapping booking for the service provider
    const providerConflict = await this.dbService.booking.findFirst({
      where: {
        serviceProviderId,
        selectedDate: date,
        OR: [
          {
            startTime: {
              lt: parsedEnd,
            },
            endTime: {
              gt: parsedStart,
            },
          },
        ],
      },
    });

    if (providerConflict) {
      throw new BadRequestException('Service provider is not available at the selected time.');
    }

    // ✅ Create new booking
    const data = await this.dbService.booking.create({
      data: {
        selectedDate: date,
        startTime: parsedStart,
        endTime: parsedEnd,
        duration,
        guestNumber: numberOfGuests,
        bookingType: 'INSTANT_BOOKING',
        bookedBy: { connect: { id } },
        serviceProvider: { connect: { id: serviceProviderId } },
        EventType: { connect: { id: eventTypeId } },
        eventName,
        plannerName,
        location,
      },
      select:{
        selectedDate: true,
        startTime: true,
        endTime: true,
        duration: true,
        guestNumber: true,
        bookingType: true,
        bookedBy: { select: { id: true } },
        serviceProvider: { select: { id: true } },
        EventType: { select: { id: true } },
        eventName: true,
        plannerName: true,
        location: true
      }
    });

    return {
      data,
      message: 'Booking created successfully',
      statusCode: 201,
      success: true,
    };
  }
}
