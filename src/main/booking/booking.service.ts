import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateBookingDto } from './dto/createBooking.dto';
import { UpdateBookingDto } from './dto/updateBooking.dto';
import { $Enums, Profile, Venue } from '@prisma/client';
import { ApiResponse } from 'src/interfaces/response';
import { IdDto } from 'src/common/dto/id.dto';
import { EventService } from 'src/lib/event/event.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly db: DbService,
    private readonly eventEmitter: EventService,
  ) {}

  //send enum service start============================
  public async sendEnum() {
    return {
      TableShape: Object.values($Enums.TableShape),
      SeatingStyle: Object.values($Enums.SeatingStyle),
      LightingStyle: Object.values($Enums.LightingStyle),
      FlowerColor: Object.values($Enums.FlowerColor),
      FlowerType: Object.values($Enums.FlowerType),
      Fragrance: Object.values($Enums.Fragrance),
    };
  }
  //send enum service end==============================

  // create booking start================================
  async create(rawData: CreateBookingDto) {
    const {
      bookedById,
      eventTypeId,
      decoration: Decoration,
      venueId,
      serviceProviderId,
      selectedDate,
      startTime,
      endTime,
      ...rest
    } = rawData;

    if (!venueId?.trim() && !serviceProviderId?.trim()) {
      throw new BadRequestException(
        'Either venueId or serviceProviderId must be provided.',
      );
    }

    let venue: Venue | null = null;
    if (venueId?.trim()) {
      venue = await this.db.venue.findUnique({
        where: { id: venueId },
      });
      if (!venue) {
        throw new BadRequestException('Venue not found.');
      }
    }

    let serviceProvider: Profile | null = null;
    if (serviceProviderId?.trim()) {
      serviceProvider = await this.db.profile.findUnique({
        where: { id: serviceProviderId },
      });
      if (!serviceProvider) {
        throw new BadRequestException('Service Provider not found.');
      }
    }

    if (venueId?.trim()) {
      if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
        throw new BadRequestException('Start time must be before end time.');
      }

      const conflictingBooking = await this.db.booking.findFirst({
        where: {
          venueId,
          selectedDate,
          AND: [
            { startTime: { lt: new Date(endTime) } },
            { endTime: { gt: new Date(startTime) } },
          ],
        },
      });

      if (conflictingBooking) {
        throw new BadRequestException(
          'The venue is already booked for the selected date and time.',
        );
      }
    }

    const booking = await this.db.booking.create({
      data: {
        ...rest,
        bookedBy: {
          connect: { id: bookedById },
        },
        EventType: {
          connect: { id: eventTypeId },
        },
        decoration: Decoration ? JSON.stringify(Decoration) : undefined,
        ...(venue && { venue: { connect: { id: venue.id } } }),
        ...(serviceProvider && {
          serviceProvider: { connect: { id: serviceProvider.id } },
        }),
        selectedDate: new Date(selectedDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    booking.decoration = JSON.parse(booking.decoration ?? '{}');

    const memberTwoId = venue?.profileId ?? serviceProvider?.id;

    if (!memberTwoId) {
      throw new BadRequestException('memberTwoId could not be resolved');
    }

    this.eventEmitter.emit('CONVERSATION_CREATE', {
      memberOneId: bookedById,
      memberTwoId,
    });

    return booking;
  }

  // create booking end================================

  // update booking start================================

  async update({ id: bookingId }: IdDto, updateData: UpdateBookingDto) {
    const booking = await this.db.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${bookingId} not found.`);
    }

    if (updateData.venueId) {
      const venue = await this.db.venue.findUnique({
        where: { id: updateData.venueId },
      });
      if (!venue) {
        throw new BadRequestException(
          `Venue with id ${updateData.venueId} not found.`,
        );
      }
    }

    if (
      updateData.venueId ||
      updateData.selectedDate ||
      updateData.startTime ||
      updateData.endTime
    ) {
      const newVenueId = updateData.venueId ?? booking.venueId;
      const newSelectedDate = updateData.selectedDate ?? booking.selectedDate;
      const newStartTime = updateData.startTime
        ? new Date(updateData.startTime)
        : booking.startTime;
      const newEndTime = updateData.endTime
        ? new Date(updateData.endTime)
        : booking.endTime;

      const conflictingBooking = await this.db.booking.findFirst({
        where: {
          id: { not: bookingId },
          venueId: newVenueId,
          selectedDate: newSelectedDate,
          AND: [
            { startTime: { lt: newEndTime } },
            { endTime: { gt: newStartTime } },
          ],
        },
      });

      if (conflictingBooking) {
        throw new BadRequestException(
          'The venue is already booked for the selected date and time.',
        );
      }
    }

    const updatePayload: any = { ...updateData };

    if (updateData.bookedById) {
      updatePayload.bookedBy = { connect: { id: updateData.bookedById } };
    }
    if (updateData.eventTypeId) {
      updatePayload.eventType = { connect: { id: updateData.eventTypeId } };
    }
    if (updateData.venueId) {
      updatePayload.venue = { connect: { id: updateData.venueId } };
    }
    if (updateData.serviceProviderId) {
      updatePayload.serviceProvider = {
        connect: { id: updateData.serviceProviderId },
      };
    }
    if (updateData.decoration) {
      updatePayload.decoration = JSON.stringify(updateData.decoration);
    }

    if (updateData.selectedDate) {
      updatePayload.selectedDate = new Date(updateData.selectedDate);
    }
    if (updateData.startTime) {
      updatePayload.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime) {
      updatePayload.endTime = new Date(updateData.endTime);
    }

    const updatedBooking = await this.db.booking.update({
      where: { id: bookingId },
      data: updatePayload,
    });

    return updatedBooking;
  }

  public async bookingList(venueOwnerId: string): Promise<
    ApiResponse<{
      requested: any[];
      pending: any[];
      confirmed: any[];
      completed: any[];
    }>
  > {
    const statuses = [
      'REQUESTED',
      'PENDING',
      'CONFIRMED',
      'COMPLETED',
    ] as const;

    const bookingPromises = statuses.map(
      async (status) =>
        await this.db.booking.findMany({
          where: {
            venue: { profileId: venueOwnerId },
            bookingStatus: status,
          },
          take: 3,
        }),
    );

    const [
      requestedBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
    ] = await Promise.all(bookingPromises);

    return {
      statusCode: 200,
      success: true,
      message: 'Bookings fetched successfully.',
      data: {
        requested: requestedBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
      },
    };
  }

  // update booking end================================

  // getBookedDate start===============================

  async getBookedDate({ id }: IdDto) {
    const booking = await this.db.booking.findMany({
      where: {
        venueId: id,
      },
      select: { 
        selectedDate: true,
        startTime: true,
        endTime: true
       },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found.`);
    }
    return booking;
  }

  // getBookedDate end================================
}
