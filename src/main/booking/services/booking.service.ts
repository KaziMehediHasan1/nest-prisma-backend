import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateBookingDto } from '../dto/createBooking.dto';
import { UpdateBookingDto } from '../dto/updateBooking.dto';
import { $Enums, Venue } from '@prisma/client';
import { ApiResponse } from 'src/interfaces/response';
import { IdDto } from 'src/common/dto/id.dto';
import { EventService } from 'src/lib/event/event.service';
import { SetPriceDto } from '../dto/setPrice.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
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
  async create(rawData: CreateBookingDto): Promise<ApiResponse<any>> {
    const {
      bookedById,
      eventTypeId,
      decoration: Decoration,
      venueId,
      selectedDate,
      startTime,
      endTime,
      ...rest
    } = rawData;

    if (!venueId?.trim()) {
      throw new BadRequestException('Venue ID is required.');
    }

    let venue: Venue | null = null;
    venue = await this.db.venue.findUnique({
      where: { id: venueId },
    });
    if (!venue) {
      throw new BadRequestException('Venue not found.');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start.getTime() >= end.getTime()) {
      throw new BadRequestException('Start time must be before end time.');
    }

    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    // Check for venue double booking
    const conflictingVenueBooking = await this.db.booking.findFirst({
      where: {
        venueId,
        selectedDate,
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });

    if (conflictingVenueBooking) {
      throw new BadRequestException(
        'The venue is already booked for the selected date and time.',
      );
    }

    try {
      const booking = await this.db.booking.create({
        data: {
          ...rest,
          bookingStatus: 'REQUESTED',
          duration: durationMinutes,
          bookedBy: {
            connect: { id: bookedById },
          },
          EventType: {
            connect: { id: eventTypeId },
          },
          decoration: Decoration ? JSON.stringify(Decoration) : undefined,
          venue: { connect: { id: venue.id } },
          selectedDate: new Date(selectedDate),
          startTime: start,
          endTime: end,
        },
      });

      booking.decoration = JSON.parse(booking.decoration ?? '{}');

      const memberTwoId = venue.profileId;

      if (!memberTwoId) {
        throw new BadRequestException('Venue owner ID could not be resolved');
      }

      this.eventEmitter.emit('CONVERSATION_CREATE', {
        memberOneId: bookedById,
        memberTwoId,
      });

      return {
        success: true,
        data: booking,
        message: 'Booking created successfully',
        statusCode: 200,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
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

    // Process each booking array to parse decoration strings into JSON objects
    const processBookings = (bookings: any[]) => {
      return bookings.map((booking) => {
        const processedBooking = { ...booking };

        if (
          processedBooking.decoration &&
          typeof processedBooking.decoration === 'string'
        ) {
          try {
            processedBooking.decoration = JSON.parse(
              processedBooking.decoration,
            );
          } catch (error) {
            processedBooking.decoration = {};
            this.logger.error(
              `Failed to parse decoration for booking ${processedBooking.id}:`,
              error,
            );
          }
        }

        return processedBooking;
      });
    };

    return {
      statusCode: 200,
      success: true,
      message: 'Bookings fetched successfully.',
      data: {
        requested: processBookings(requestedBookings),
        pending: processBookings(pendingBookings),
        confirmed: processBookings(confirmedBookings),
        completed: processBookings(completedBookings),
      },
    };
  }

  // update booking end================================

  // getBookedDate start===============================

  async getBookedDate(
    { id }: IdDto,
    dataOnly?: boolean,
  ): Promise<ApiResponse<any> | any> {
    const booking = await this.db.booking.findMany({
      where: {
        venueId: id,
      },
      select: {
        selectedDate: true,
        startTime: true,
        endTime: true,
      },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found.`);
    }
    if (dataOnly) {
      return booking;
    }
    return {
      data: booking,
      message: 'Bookings fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  // getBookedDate end================================

  // Set price start ================================

  async setPrice({ id, totalAmount }: SetPriceDto): Promise<ApiResponse<any>> {
    const booking = await this.db.booking.findUnique({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found.`);
    }
    const updatedBooking = await this.db.booking.update({
      where: { id: booking.id, bookingStatus: $Enums.BookingStatus.REQUESTED },
      data: { totalAmount, due: totalAmount, paid: 0 },
    });
    return {
      data: updatedBooking,
      message: 'Price updated successfully',
      statusCode: 200,
      success: true,
    };
  }

  // Set price end ================================

  async getAllVenueOwnerBookings(
    ownerId: string,
    { skip, take }: PaginationDto,
  ): Promise<ApiResponse<any>> {
    // Step 1: Get all venues owned by this user
    const venues = await this.db.venue.findMany({
      where: {
        Profile: {
          id: ownerId,
        },
      },
      select: {
        id: true,
        name: true,
      },
      skip,
      take,
    });

    const venueIds = venues.map((v) => v.id);

    if (venueIds.length === 0) {
      return {
        data: [],
        message: 'No venues found',
        statusCode: 200,
        success: true,
      };
    }

    // Step 2: Get bookings with status PENDING or CONFIRMED for those venues
    const bookings = await this.db.booking.findMany({
      where: {
        venueId: {
          in: venueIds,
        },
        bookingStatus: {
          in: ['PENDING', 'CONFIRMED', 'REQUESTED'],
        },
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            venueImage:{
              select:{
                path: true
              }
            },
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Step 3: Format response
    const data = await bookings.map((booking) => ({
      id: booking.id,
      venueName: booking.venue?.name ?? 'Unknown Venue',
      userName: booking.venue?.Profile?.name ?? 'Unknown Owner',
      status: booking.bookingStatus,
      eventDate: booking.selectedDate,
      totalAmount: booking.totalAmount,
      createdAt: booking.createdAt,
      startTime: booking.startTime,
      endTime: booking.endTime,
      venueImage: booking.venue?.venueImage?.path ?? null,
      venueId: booking.venue?.id ?? null,
      bookedById: booking.bookedById,
      eventName: booking.eventName,
    }));

    return {
      data,
      message: 'Bookings fetched successfully',
      statusCode: 200,
      success: true,
    };
  }
}