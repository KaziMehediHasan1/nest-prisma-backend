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

@Injectable()
export class VenueService {
  constructor(
    private readonly db: DbService,
    private readonly uploadService: UploadService,
    private readonly eventEmitter: EventService,
  ) {}

  // create venue start================================`
  public async createVenue(dto: CreateVenueDto) {
    const { arrangementsImage, decoration, profileId, amenityIds, ...rest } =
      dto;

    let fileInstance: FileInstance | null = null;

    if (arrangementsImage) {
      fileInstance = await this.uploadService.uploadFile({
        file: arrangementsImage,
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
          Decoration: {
            create: decoration,
          },
          ...(fileInstance?.id && {
            arrangementsImage: {
              connect: { id: fileInstance.id },
            },
          }),
        },
        include: {
          amenities: true,
          Decoration: {
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
        },
      });

      return newVenue;
    } catch (error) {
      if (fileInstance) {
        this.eventEmitter.emit('FILE_DELETE', {
          Key: fileInstance.fileId,
        });
      }
      throw error;
    }
  }
  // create venue end================================`

  // update venue start==============================

  public async updateVenue({ id }: IdDto, dto: UpdateVenueDto) {
    const { arrangementsImage, decoration, profileId, amenityIds, ...rest } =
      dto;

    let fileInstance: FileInstance | null = null;

    if (arrangementsImage) {
      fileInstance = await this.uploadService.uploadFile({
        file: arrangementsImage,
      });
    }

    const existingVenue = await this.db.venue.findUnique({
      where: { id },
      include: { amenities: true, Decoration: true, arrangementsImage: true },
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
          Decoration: decoration ? { update: decoration } : undefined,
          ...(fileInstance?.id && {
            arrangementsImage: {
              connect: { id: fileInstance.id },
            },
          }),
        },
        include: {
          amenities: true,
          Decoration: true,
          arrangementsImage: { select: { path: true } },
        },
      });

      return updatedVenue;
    } catch (error) {
      if (fileInstance) {
        this.eventEmitter.emit('FILE_DELETE', { Key: fileInstance.fileId });
      }
      throw error;
    }
  }

  // update venue end================================

  // delete venue start=============================
  public async deleteVenue({ id }: IdDto) {
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

    return { message: 'Venue deleted successfully' };
  }
  // delete venue end===============================

  // get venue by id start=========================

  public async getVenueById({ id }: IdDto) {
    const venue = await this.db.venue.findUnique({
      where: { id },
      include: {
        amenities: true,
        Decoration: true,
        arrangementsImage: { select: { path: true } },
      },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    return venue;
  }

  // get venue by id end===========================

  // getAll venue start============================

  // getAll venue end==============================
}
