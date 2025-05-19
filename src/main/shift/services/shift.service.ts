import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateShiftDto } from '../dto/createShift.dto';
import { Venue } from '@prisma/client';
import { UpdateShiftDto } from '../dto/updateShift.sto';
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

  // Validate venue exists
  const isExist = await this.isVenueExist(venueId);
  if (!isExist) {
    throw new NotFoundException('Venue does not exist');
  }

  // Convert string dates to Date objects
  const startTimeDate = new Date(startTime);
  const endTimeDate = new Date(endTime);

  // Validate that end time is after start time
  if (endTimeDate <= startTimeDate) {
    throw new BadRequestException('End time must be after start time');
  }

  // Check for overlapping shifts
  const overlappingShift = await this.dbService.shift.findFirst({
    where: {
      venueId: isExist.id,
      OR: [
        {
          startTime: {
            lte: endTimeDate,
          },
          endTime: {
            gte: startTimeDate,
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

  // Calculate duration in minutes
  const durationInMs = endTimeDate.getTime() - startTimeDate.getTime();
  const durationInMinutes = Math.floor(durationInMs / (1000 * 60));

  // Create shift with calculated duration
  const shift = await this.dbService.shift.create({
    data: {
      venueId,
      startTime: startTimeDate,
      endTime: endTimeDate,
      duration: durationInMinutes,
      shiftName: dto.shiftName,
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

  // Determine effective values
  const startTime = dto.startTime
    ? new Date(dto.startTime)
    : existingShift.startTime;

  const endTime = dto.endTime
    ? new Date(dto.endTime)
    : existingShift.endTime;

  const venueId = dto.venueId || existingShift.venueId;

  // Validate that end time is after start time
  if (endTime <= startTime) {
    throw new BadRequestException('End time must be after start time');
  }

  // Check for overlapping shifts excluding this shift
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

  // Calculate duration in minutes
  const durationInMs = endTime.getTime() - startTime.getTime();
  const durationInMinutes = Math.floor(durationInMs / (1000 * 60));

  const updatedShift = await this.dbService.shift.update({
    where: { id },
    data: {
      startTime: dto.startTime ? startTime : undefined,
      endTime: dto.endTime ? endTime : undefined,
      duration: durationInMinutes,
      shiftName: dto.shiftName ?? undefined,
      venueId: dto.venueId ?? undefined,
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
