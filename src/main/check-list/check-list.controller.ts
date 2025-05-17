import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CheckListService } from './services/check-list.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateTaskDto } from './dto/createTask.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@Controller('check-list')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
@Roles('PLANNER')
export class CheckListController {
  constructor(private readonly checkListService: CheckListService) {}

  @Get()
  async getAll(@Query() pagination: PaginationDto) {
    return this.checkListService.getAll(pagination);
  }

  @Post()
  async create(@Body() data: CreateTaskDto) {
    return this.checkListService.crateCheckList(data);
  }

  @Post('update/:id')
  async update(@Body() data: CreateTaskDto, @Query() id: IdDto) {
    return this.checkListService.update(id, data);
  }

  @Delete('delete/:id')
  async delete(@Query() id: IdDto) {
    return this.checkListService.delete(id);
  }

  @Get('get/:id')
  async get(@Query() id: IdDto) {
    return this.checkListService.getTaskById(id);
  }

  @Get('filter')
  async filter(@Query() data: FilterTaskDto) {
    return this.checkListService.filter(data);
  }
}
