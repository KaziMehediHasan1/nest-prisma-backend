import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateVenueDto } from './dto/venueCreate.dto';
import { FileInstance } from '@prisma/client';
import { UploadService } from 'src/lib/upload/upload.service';
import { EventService } from 'src/lib/event/event.service';
import { UpdateVenueDto } from './dto/updateVenue.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/interfaces/response';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { VenueRevenueService } from './venue-revenue.service';
import { BookingService } from '../booking/booking.service';
import { IdsDto } from 'src/common/dto/ids.sto';

@Injectable()
export class VenueService {
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
    private readonly eventEmitter: EventService,
    private readonly venueRevenueService: VenueRevenueService,
    private readonly bookingService: BookingService,
  ) {}

  // create venue start================================`
  public async createVenue(
    id: IdDto,
    dto: CreateVenueDto,
  ): Promise<ApiResponse<any>> {
    const {
      arrangementsImage,
      venueImage,
      price,
      decoration,
      profileId,
      amenityIds,
      bookingType,
      ...rest
    } = dto;

    const user = await this.db.user.findUnique({
      where: { id: profileId },
    });
    let fileInstance: FileInstance | null = null;
    let fileInstanceTwo: FileInstance | null = null;

    if (arrangementsImage) {
      fileInstance = await this.uploadService.uploadFile({
        file: arrangementsImage,
      });
    }

    if (venueImage) {
      fileInstanceTwo = await this.uploadService.uploadFile({
        file: venueImage,
      });
    }

    const foundAmenities = await this.db.amenities.findMany({
      where: { id: { in: amenityIds } },
    });

    if (foundAmenities.length !== amenityIds.length) {
      const missing = amenityIds.filter(
        (id) => !foundAmenities.some((a) => a.id === id),
      );
      if (fileInstance) {
        this.eventEmitter.emit('FILE_DELETE', { Key: fileInstance.fileId });
      }
      throw new BadRequestException(
        `Invalid amenity IDs: ${missing.join(', ')}`,
      );
    }

    try {
      const newVenue = await this.db.venue.create({
        data: {
          ...rest,
          bookingType: bookingType ? bookingType : 'REQUEST_BASED_BOOKING',
          price: price ? price : 0,
          Profile: { connect: { id: profileId } },
          amenities: {
            connect: foundAmenities.map((a) => ({ id: a.id })),
          },
          decoration: {
            create: decoration,
          },
          ...(fileInstance?.id && {
            arrangementsImage: {
              connect: { id: fileInstance.id },
            },
          }),
          ...(fileInstanceTwo?.id && {
            venueImage: {
              connect: { id: fileInstanceTwo.id },
            },
          }),
          verified: user?.isVerified ? true : false,
        },
        include: {
          amenities: true,
          decoration: {
            select: {
              flowerColors: true,
              flowerTypes: true,
              fragrances: true,
              lighting: true,
              tableShapes: true,
              seatingStyles: true,
            },
          },
          arrangementsImage: { select: { path: true } },
          venueImage: { select: { path: true } },
        },
      });

      return {
        data: newVenue,
        message: 'Venue created successfully',
        statusCode: 201,
        success: true,
      };
    } catch (error) {
      if (fileInstance) {
        this.eventEmitter.emit('FILE_DELETE', {
          Key: fileInstance.fileId,
        });
      }
      if (fileInstanceTwo) {
        this.eventEmitter.emit('FILE_DELETE', {
          Key: fileInstanceTwo.fileId,
        });
      }
      throw error;
    }
  }
  // create venue end================================`

  // update venue start==============================

  public async updateVenue(
    { id }: IdDto,
    dto: UpdateVenueDto,
  ): Promise<ApiResponse<any>> {
    const {
      arrangementsImage,
      venueImage,
      decoration,
      profileId,
      amenityIds,
      ...rest
    } = dto;

    let fileInstance: FileInstance | null = null;
    let fileInstanceTwo: FileInstance | null = null;

    if (arrangementsImage) {
      fileInstance = await this.uploadService.uploadFile({
        file: arrangementsImage,
      });
    }

    if (venueImage) {
      fileInstanceTwo = await this.uploadService.uploadFile({
        file: venueImage,
      });
    }

    const existingVenue = await this.db.venue.findUnique({
      where: { id },
      include: { amenities: true, decoration: true, arrangementsImage: true },
    });

    if (!existingVenue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    const foundAmenities = await this.db.amenities.findMany({
      where: { id: { in: amenityIds || [] } },
    });

    if (foundAmenities.length !== (amenityIds?.length || 0)) {
      const missing = amenityIds?.filter(
        (id) => !foundAmenities.some((a) => a.id === id),
      );
      if (fileInstance) {
        this.eventEmitter.emit('FILE_DELETE', { Key: fileInstance.fileId });
      }
      throw new BadRequestException(
        `Invalid amenity IDs: ${missing?.join(', ')}`,
      );
    }

    try {
      const updatedVenue = await this.db.venue.update({
        where: { id },
        data: {
          ...rest,
          Profile: profileId ? { connect: { id: profileId } } : undefined,
          amenities: amenityIds
            ? { connect: foundAmenities.map((a) => ({ id: a.id })) }
            : undefined,
          decoration: decoration ? { update: decoration } : undefined,
          ...(fileInstance?.id && {
            arrangementsImage: {
              connect: { id: fileInstance.id },
            },
          }),
          ...(fileInstanceTwo?.id && {
            venueImage: {
              connect: { id: fileInstanceTwo.id },
            },
          }),
        },
        include: {
          amenities: true,
          decoration: true,
          arrangementsImage: { select: { path: true } },
          venueImage: { select: { path: true } },
        },
      });

      return {
        data: updatedVenue,
        message: 'Venue updated successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      if (fileInstance) {
        this.eventEmitter.emit('FILE_DELETE', { Key: fileInstance.fileId });
      }
      if (fileInstanceTwo) {
        this.eventEmitter.emit('FILE_DELETE', { Key: fileInstanceTwo.fileId });
      }
      throw error;
    }
  }

  // update venue end================================

  // delete venue start=============================
  public async deleteVenue({ id }: IdDto): Promise<ApiResponse<null>> {
    const venue = await this.db.venue.findUnique({
      where: { id },
      include: { arrangementsImage: true },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    if (venue.arrangementsImage) {
      this.eventEmitter.emit('FILE_DELETE', {
        Key: venue.arrangementsImage.fileId,
      });
    }

    await this.db.venue.delete({
      where: { id },
    });

    return {
      data: null,
      message: 'Venue deleted successfully',
      statusCode: 200,
      success: true,
    };
  }
  // delete venue end===============================

  // get venue by id start=========================

  public async getVenueById({ id }: IdDto): Promise<ApiResponse<any>> {
    const venue = await this.db.venue.findUnique({
      where: { id },
      include: {
        amenities: true,
        decoration: true,
        arrangementsImage: { select: { path: true } },
        venueImage: { select: { path: true } },
        reviews: {
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
        },
      },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    const venueMetrics = await this.venueRevenueService.getVenueMetrics(
      venue.id,
    );
    const bookedDate = await this.bookingService.getBookedDate({ id }, true);
    const bookingRequest = await this.db.booking.findMany({
      where: {
        venueId: id,
        bookingStatus: 'REQUESTED',
      },
      include: {
        EventType: {
          include: {
            avatar: {
              select: {
                path: true,
              },
            },
          },
        },
      },
      take: 3,
    });

    const averageRating = await this.db.review.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        Venue: {
          id,
        },
      },
    });

    return {
      data: {
        venue,
        venueMetrics,
        bookedDate,
        bookingRequest,
        ratting: averageRating._avg.rating ?? 0,
      },
      message: 'Venue fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  // get venue by id end===========================

  // getAll venue start============================

  public async getAllVenues({
    take,
    skip,
  }: PaginationDto): Promise<ApiResponse<any>> {
    const venues = await this.db.venue.findMany({
      include: {
        amenities: {
          select: {
            name: true,
          },
        },
        decoration: true,
        arrangementsImage: { select: { path: true } },
      },
      take,
      skip,
    });

    return {
      data: venues,
      message: 'Venues fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  // getAll venue end==============================
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
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

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
    prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : null;

  return {
    totalRevenue,
    currentMonthRevenue: currentRevenue,
    previousMonthRevenue: prevRevenue,
    growthRate: growthRate !== null ? +growthRate.toFixed(2) : 'N/A',
    totalPendingBookings: pendingCount,
    totalVenues: venueIds.length,
  };
}


  async getThreeUpcomingEvents(id:string) {
    const today = new Date();
    console.log(today);
    

    const bookings = await this.db.booking.findMany({
      where: {
        selectedDate: {
          gte: today,
        },
        venue:{
          profileId:id
        }
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

  async getOverviewOfVenueOwnerHome(id: string):Promise<ApiResponse<any>> {
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
      success: true
     };
  }

  // getAll venue by venue owner end==============================

  async getVenueForComparison({
     ids
  }:IdsDto):Promise<ApiResponse<any>>{
    const venues = await this.db.venue.findMany({
      where: {
        id: {
          in: ids
        }
      },
      include: {
        venueImage: { select: { path: true } },
        decoration: true
      },
      
    });
    return { 
      data: venues,
      message: 'Venues fetched successfully',
      statusCode: 200,
      success: true
     };
  }
}
