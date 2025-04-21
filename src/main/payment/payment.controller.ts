import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';

@Controller('payment')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get("cash_in/venue_owner/:id")
  @Roles("VENUE_OWNER")
  @UseGuards(RolesGuard)
  async getCashInListForVenue(@Param() { id }: IdDto, @Query() params: PaginationDto) {
    return await this.paymentService.getCashInListForVenue(id, params);
  }
}
