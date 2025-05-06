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

@Injectable()
export class VenueService {
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
    private readonly eventEmitter: EventService,
  ) {}

  // create venue start================================`
  public async createVenue(id:IdDto,dto: CreateVenueDto):Promise<ApiResponse<any>> {
    const { arrangementsImage, venueImage, decoration, profileId, amenityIds, ...rest } =
      dto;

      const user = await this.db.user.findUnique({
        where: { id: profileId },
      })
    let fileInstance: FileInstance | null = null;
    let fileInstanceTwo: FileInstance | null = null;

    if (arrangementsImage) {
      fileInstance = await this.uploadService.uploadFile({
        file: arrangementsImage,
      });
    }

    if(venueImage) {
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
          verified: user?.isVerified? true : false
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
        success: true
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

  public async updateVenue({ id }: IdDto, dto: UpdateVenueDto): Promise<ApiResponse<any>> {
    const { arrangementsImage, venueImage, decoration, profileId, amenityIds, ...rest } =
      dto;

    let fileInstance: FileInstance | null = null;
    let fileInstanceTwo: FileInstance | null = null;

    if (arrangementsImage) {
      fileInstance = await this.uploadService.uploadFile({
        file: arrangementsImage,
      });
    }

    if(venueImage) {
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
        success: true
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
      success: true
    };
  }
  // delete venue end===============================

  // get venue by id start=========================

  public async getVenueById({ id }: IdDto):Promise<ApiResponse<any>> {
    const venue = await this.db.venue.findUnique({
      where: { id },
      include: {
        amenities: true,
        decoration: true,
        arrangementsImage: { select: { path: true } },
      },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    return {
      data: venue,
      message: 'Venue fetched successfully',
      statusCode: 200,
      success: true
    };
  }

  // get venue by id end===========================

  // getAll venue start============================

  public async getAllVenues({
    take, skip
  }:PaginationDto):Promise<ApiResponse<any>> {
    const venues = await this.db.venue.findMany({
      include: {
        amenities: {
          select: {
            name: true,
          }
        },
        decoration: true,
        arrangementsImage: { select: { path: true } },
      },
      take,
      skip
    });

    return{
      data: venues,
      message: "Venues fetched successfully",
      statusCode: 200,
      success: true,
    }
  }

  // getAll venue end==============================
}
