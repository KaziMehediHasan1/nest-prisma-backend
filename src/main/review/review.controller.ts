import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './services/review.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateReviewDto } from './dto/createReview.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { query } from 'express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';

@Controller('review')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
  async createReview(@Body() rawData: CreateReviewDto) {
    return this.reviewService.createReview(rawData);
  }

  @Get('get-all/venue/:id')
  @Roles('PLANNER')
  async getVenueReviews(
    @Param() id: IdDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.reviewService.getAllReviews(id, 'venue', pagination);
  }

  @Get('get-all/service-provider')
  @Roles('PLANNER', 'SERVICE_PROVIDER')
  async getServiceProviderReviews(
    @Req() { user: { profileId: id } }: AuthenticatedRequest,
    @Query() pagination: PaginationDto,
  ) {
    if (!id) {
      throw new BadRequestException('Profile not found');
    }
    return this.reviewService.getAllReviews({ id }, 'profile', pagination);
  }

  @Get('get-all/venue-owner')
  @Roles('VENUE_OWNER')
  async getVenueOwnerReviews(
    @Req() { user: { profileId: id } }: AuthenticatedRequest,
    @Query() pagination: PaginationDto,
  ) {
    if (!id) {
      throw new BadRequestException('Profile not found');
    }
    return this.reviewService.getAllVenueOwnerReviews(id, pagination);
  }
}
