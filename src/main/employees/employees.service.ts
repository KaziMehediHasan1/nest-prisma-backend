import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { UpdateEmployeeDto } from './dto/updateEmployee.dto';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { IdDto } from 'src/common/dto/id.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly db: DbService) {}

  async createEmployee(dto: CreateEmployeeDto) {
    const { email, phone } = dto;

    // Check for email or phone conflicts
    const existing = await this.db.employee.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existing) {
      throw new ConflictException('Email or phone number already in use');
    }

    return this.db.employee.create({
      data: dto,
    });
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto) {
    const existingEmployee = await this.db.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    // Conflict check for email/phone (excluding current employee)
    const orConditions: Prisma.EmployeeWhereInput[] = [];
    if (dto.email) {
      orConditions.push({ email: dto.email });
    }
    if (dto.phone) {
      orConditions.push({ phone: dto.phone });
    }

    if (orConditions.length > 0) {
      const conflict = await this.db.employee.findFirst({
        where: {
          AND: [{ id: { not: id } }, { OR: orConditions }],
        },
      });

      if (conflict) {
        throw new ConflictException('Email or phone number already in use');
      }
    }

    return this.db.employee.update({
      where: { id },
      data: dto,
    });
  }

  async getAllEmployees({
    skip,
    take
  }:PaginationDto) {
    return this.db.employee.findMany({
      include: {
        venue: true, // includes related venue if needed
        shifts: true, // includes assigned shifts if needed
      },
      take,
      skip
    });
  }

  async getEmployeeById(id: IdDto) {
    return this.db.employee.findUnique({
      where: id,
      include: {
        venue: true, // includes related venue if needed
        shifts: true, // includes assigned shifts if needed
      },
    });
  }

  async deleteEmployee(id: string) {
    const employee = await this.db.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.db.employee.delete({
      where: { id },
    });
  }
}
