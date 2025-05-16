import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { get } from 'http';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
@Roles('ADMIN')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard-analytics')
  async returnAnalytics() {
    return await this.analyticsService.returnDashboardAnalytics();
  }

  @Get('user-analytics')
  async getUserGrowthLast6Months() {
    return await this.analyticsService.getUserGrowthLast6Months();
  }

  @Get('user-role-analytics')
  async getUserRoleDistribution() {
    return await this.analyticsService.getUserRoleDistribution();
  }
}
