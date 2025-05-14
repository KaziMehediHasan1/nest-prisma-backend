import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateReviewDto } from './dto/createReview.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { query } from 'express';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('review')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
  @Roles('PLANNER')
  async createReview(rawData: CreateReviewDto) {
    return this.reviewService.createReview(rawData);
  }

  @Get('get-all/venue/:id')
  @Roles('PLANNER')
  async getVenueReviews(@Param() id: IdDto, @Query() pagination: PaginationDto) {
    return this.reviewService.getAllReviews(id, 'venue', pagination);
  }

  @Get('get-all/service-provider/:id')
  @Roles('PLANNER',"SERVICE_PROVIDER")
  async getServiceProviderReviews(@Param() id: IdDto, @Query() pagination: PaginationDto) {
    return this.reviewService.getAllReviews(id, 'profile', pagination);
  }

}
