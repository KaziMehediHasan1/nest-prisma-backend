import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateShiftDto } from './dto/createShift.dto';
import { Venue } from '@prisma/client';
import { UpdateShiftDto } from './dto/updateShift.sto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { IdDto } from 'src/common/dto/id.dto';

@Injectable()
export class ShiftService {
  constructor(private readonly dbService: DbService) {}

  public async isVenueExist(id: string) {
    return this.dbService.venue.findUnique({
      where: {
        id,
      },
    });
  }

  async createShift(dto: CreateShiftDto) {
    const { venueId, startTime, endTime } = dto;

    const isExist = await this.isVenueExist(venueId);
    if (!isExist) {
      throw new NotFoundException('Venue does not exist');
    }

    const overlappingShift = await this.dbService.shift.findFirst({
      where: {
        venueId: isExist.id,
        OR: [
          {
            startTime: {
              lte: new Date(endTime),
            },
            endTime: {
              gte: new Date(startTime),
            },
          },
        ],
      },
    });

    if (overlappingShift) {
      throw new ConflictException(
        'Shift time conflicts with an existing shift',
      );
    }

    // Create shift
    return this.dbService.shift.create({
      data: {
        ...dto,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
      },
    });
  }

  async updateShift(id: string, dto: UpdateShiftDto) {
    const existingShift = await this.dbService.shift.findUnique({
      where: { id },
    });

    if (!existingShift) {
      throw new NotFoundException('Shift not found');
    }

    // Use updated or existing values for conflict check
    const startTime = dto.startTime ? new Date(dto.startTime) : existingShift.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : existingShift.endTime;
    const venueId = dto.venueId || existingShift.venueId;

    // Conflict check (excluding this shift itself)
    const conflictingShift = await this.dbService.shift.findFirst({
      where: {
        id: { not: id },
        venueId,
        startTime: { lte: endTime },
        endTime: { gte: startTime },
      },
    });

    if (conflictingShift) {
      throw new ConflictException('Updated shift conflicts with another shift');
    }

    return this.dbService.shift.update({
      where: { id },
      data: {
        ...dto,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
    });
  }

  async getAllShifts({
    skip,
    take
  }:PaginationDto) {
    return this.dbService.shift.findMany({
      include: {
        venue: true,
        employee: true,
      },
      take,
      skip,
      orderBy: { startTime: 'asc' },
    });
  }

  async getShiftById(id: IdDto) {
    return this.dbService.shift.findUnique({
      where:  id ,
      include: {
        venue: true,
        employee: true,
      },
    });
  }
  async deleteShift(id: IdDto) {
    const shift = await this.dbService.shift.findUnique({ where: id });
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    await this.dbService.shift.delete({ where: id });
    return { message: 'Shift deleted successfully' };
  }
}
