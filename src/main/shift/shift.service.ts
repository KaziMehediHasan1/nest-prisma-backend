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
import { ApiResponse } from 'src/interfaces/response';

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

  async createShift(dto: CreateShiftDto): Promise<ApiResponse<any>> {
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
    const shift = await this.dbService.shift.create({
      data: {
        ...dto,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
      },
    });

    return {
      message: 'Shift created successfully',
      data: shift,
      statusCode: 201,
      success: true,
    };
  }

  async updateShift(
    id: string,
    dto: UpdateShiftDto,
  ): Promise<ApiResponse<any>> {
    const existingShift = await this.dbService.shift.findUnique({
      where: { id },
    });

    if (!existingShift) {
      throw new NotFoundException('Shift not found');
    }

    // Use updated or existing values for conflict check
    const startTime = dto.startTime
      ? new Date(dto.startTime)
      : existingShift.startTime;
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

    const updatedShift = await this.dbService.shift.update({
      where: { id },
      data: {
        ...dto,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
    });

    return {
      data: updatedShift,
      message: 'Shift updated successfully',
      statusCode: 200,
      success: true,
    };
  }

  async getAllShifts({ skip, take }: PaginationDto): Promise<ApiResponse<any>> {
    const shifts = await this.dbService.shift.findMany({
      include: {
        venue: true,
        employee: true,
      },
      take,
      skip,
      orderBy: { startTime: 'asc' },
    });

    return {
      data: shifts,
      message: 'Shifts fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  async getShiftById(id: IdDto): Promise<ApiResponse<any>> {
    const shift = await this.dbService.shift.findUnique({
      where: id,
      include: {
        venue: true,
        employee: true,
      },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return {
      data: shift,
      message: 'Shift fetched successfully',
      statusCode: 200,
      success: true,
    };
  }

  async deleteShift(id: IdDto): Promise<ApiResponse<any>> {
    const shift = await this.dbService.shift.findUnique({ where: id });
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    await this.dbService.shift.delete({ where: id });
    return {
      data: null,
      message: 'Shift deleted successfully',
      statusCode: 200,
      success: true,
    };
  }
}
