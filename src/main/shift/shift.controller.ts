import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShiftService } from './services/shift.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { CreateShiftDto } from './dto/createShift.dto';
import { UpdateShiftDto } from './dto/updateShift.sto';

@Controller('shift')
@ApiBearerAuth()
@Roles('VENUE_OWNER')
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get('/all')
  async getAllShifts(@Query() params: PaginationDto) {
    return await this.shiftService.getAllShifts(params);
  }

  @Get('/:id')
  async getShiftById(@Param() params: IdDto) {
    return await this.shiftService.getShiftById(params);
  }

  @Post('/create')
  async createShift(@Body() data: CreateShiftDto) {
    return await this.shiftService.createShift(data);
  }

  @Patch('/update/:id')
  async updateShift(@Param() params: IdDto, @Body() data: UpdateShiftDto) {
    return await this.shiftService.updateShift(params.id, data);
  }

  @Delete('/delete/:id')
  async deleteShift(@Param() params: IdDto) {
    return await this.shiftService.deleteShift(params);
  }
}
