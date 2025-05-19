import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './services/employees.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { UpdateEmployeeDto } from './dto/updateEmployee.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('employees')
@ApiBearerAuth()
@Roles('VENUE_OWNER')
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post('create')
  createEmployee(@Body() data: CreateEmployeeDto) {
    return this.employeesService.createEmployee(data);
  }

  @Post('update/:id')
  updateEmployee(@Body() data: UpdateEmployeeDto, @Param() { id }: IdDto) {
    return this.employeesService.updateEmployee(id, data);
  }

  @Get('all')
  getAllEmployees(@Query() params: PaginationDto) {
    return this.employeesService.getAllEmployees(params);
  }

  @Get(':id')
  getEmployeeById(@Param() params: IdDto) {
    return this.employeesService.getEmployeeById(params);
  }

  @Delete(':id')
  deleteEmployee(@Param() { id }: IdDto) {
    return this.employeesService.deleteEmployee(id);
  }
}
