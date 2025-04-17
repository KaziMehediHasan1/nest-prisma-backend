import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateBookingDto } from './dto/createBooking.dto';
import { UpdateBookingDto } from './dto/updateBooking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly db: DbService) {}

  // create venue start================================
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

    // Check if the venue exists
    const venue = await this.db.venue.findUnique({
      where: { id: venueId },
    });
    if (!venue) {
      throw new BadRequestException('Venue not found.');
    }

    // Check if there is an overlapping booking for the same venue.
    // Adjust this condition based on your actual business logic.
    const conflictingBooking = await this.db.booking.findFirst({
      where: {
        venueId: venueId,
        // Depending on how you handle dates you could add:
        selectedDate: selectedDate,
        AND: [
          {
            startTime: {
              lt: new Date(endTime),
            },
          },
          {
            endTime: {
              gt: new Date(startTime),
            },
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException(
        'The venue is already booked for the selected date and time.'
      );
    }

    const booking = await this.db.booking.create({
      data: {
        ...rest,
        bookedBy: {
          connect: {
            id: bookedById,
          },
        },
        eventType: {
          connect: {
            id: eventTypeId,
          },
        },
        decoration: Decoration ? JSON.stringify(Decoration) : undefined,
        venue: {
          connect: {
            id: venueId,
          },
        },
        serviceProvider: {
          connect: {
            id: serviceProviderId,
          },
        },
        selectedDate: new Date(selectedDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return booking;
  }
  // create venue end================================

  // update venue start================================

  async update(bookingId: string, updateData: UpdateBookingDto) {
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
          `Venue with id ${updateData.venueId} not found.`
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
          'The venue is already booked for the selected date and time.'
        );
      }
    }

    const {
      bookedById,
      eventTypeId,
      venueId,
      serviceProviderId,
      decoration,
      ...rest
    } = updateData;

    const updatePayload: any = {
      ...rest,
    };

    if (bookedById) {
      updatePayload.bookedBy = { connect: { id: bookedById } };
    }
    if (eventTypeId) {
      updatePayload.eventType = { connect: { id: eventTypeId } };
    }
    if (venueId) {
      updatePayload.venue = { connect: { id: venueId } };
    }
    if (serviceProviderId) {
      updatePayload.serviceProvider = { connect: { id: serviceProviderId } };
    }
    // Convert decoration to a JSON string if updated.
    if (decoration) {
      updatePayload.decoration = JSON.stringify(decoration);
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

  // update venue end================================
}
