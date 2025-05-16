import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { startOfMonth, subMonths, format } from 'date-fns';
import { ApiResponse } from 'src/interfaces/response';
import { UserRole } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DbService) {}

  async getTotalUsers(): Promise<{ count: number; growthRate: number }> {
    const currentCount = await this.db.user.count();

    const lastMonthDate = subMonths(new Date(), 1);
    const lastMonthCount = await this.db.user.count({
      where: {
        createdAt: {
          lt: new Date(),
          gte: lastMonthDate,
        },
      },
    });

    const growthRate =
      lastMonthCount === 0
        ? 0
        : ((currentCount - lastMonthCount) / lastMonthCount) * 100;

    return { count: currentCount, growthRate };
  }

  async getActiveVenues(): Promise<{ count: number; growthRate: number }> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const currentCount = await this.db.venue.count({
      where: {
        bookings: {
          some: {
            createdAt: {
              gte: oneMonthAgo,
            },
          },
        },
      },
    });

    const twoMonthsAgo = subMonths(new Date(), 2);
    const previousCount = await this.db.venue.count({
      where: {
        bookings: {
          some: {
            createdAt: {
              gte: twoMonthsAgo,
              lt: oneMonthAgo,
            },
          },
        },
      },
    });

    const growthRate =
      previousCount === 0
        ? 0
        : ((currentCount - previousCount) / previousCount) * 100;

    return { count: currentCount, growthRate };
  }

  async getMonthlyRevenue(): Promise<{ amount: number; growthRate: number }> {
    const currentMonthStart = startOfMonth(new Date());
    const previousMonthStart = subMonths(currentMonthStart, 1);

    const currentPayments = await this.db.payment.findMany({
      where: {
        createdAt: {
          gte: currentMonthStart,
        },
        paymentStatus: 'COMPLETED',
      },
      select: {
        amount: true,
      },
    });

    const previousPayments = await this.db.payment.findMany({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lt: currentMonthStart,
        },
        paymentStatus: 'COMPLETED',
      },
      select: {
        amount: true,
      },
    });

    const currentAmount = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    const previousAmount = previousPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );
    const growthRate =
      previousAmount === 0
        ? 0
        : ((currentAmount - previousAmount) / previousAmount) * 100;

    return { amount: currentAmount, growthRate };
  }

  async getMonthlyBookingTrends(
    months: number = 6,
  ): Promise<{ month: string; bookings: number }[]> {
    const trends: { month: string; bookings: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const nextMonthStart = startOfMonth(subMonths(new Date(), i - 1));

      const bookingCount = await this.db.booking.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
      });

      trends.push({
        month: format(monthStart, 'MMM yyyy'),
        bookings: bookingCount,
      });
    }

    return trends;
  }

  async getMonthlyEarningTrends(
    months: number = 6,
  ): Promise<{ month: string; earnings: number }[]> {
    const trends: { month: string; earnings: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const nextMonthStart = startOfMonth(subMonths(new Date(), i - 1));

      const payments = await this.db.payment.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
          paymentStatus: 'COMPLETED',
        },
        select: { amount: true },
      });

      const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

      trends.push({
        month: format(monthStart, 'MMM yyyy'),
        earnings: totalEarnings,
      });
    }

    return trends;
  }

  async returnDashboardAnalytics(): Promise<ApiResponse<any>> {
    const totalUsers = await this.getTotalUsers();
    const activeVenues = await this.getActiveVenues();
    const monthlyRevenue = await this.getMonthlyRevenue();
    const monthlyBookingTrends = (
      await this.getMonthlyBookingTrends()
    ).reverse();
    const monthlyEarningTrends = (
      await this.getMonthlyEarningTrends()
    ).reverse();
    return {
      success: true,
      message: 'Analytics fetched successfully',
      statusCode: 200,
      data: {
        totalUsers,
        activeVenues,
        monthlyRevenue,
        monthlyBookingTrends,
        monthlyEarningTrends,
      },
    };
  }

  async getUserGrowthLast6Months() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5); // Include current month = 6 total

    // Get all users created in the last 6 months
    const users = await this.db.user.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate.getFullYear(), startDate.getMonth(), 1),
          lte: new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0),
        },
      },
      select: {
        role: true,
        createdAt: true,
      },
    });

    // Generate labels like ['2024-12', '2025-01', ..., '2025-05']
    const labels: string[] = [];
    const monthIndexMap: Record<string, number> = {};

    for (let i = 0; i < 6; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1,
      );
      const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      labels.push(label);
      monthIndexMap[label] = i;
    }

    // Initialize counts
    const data = {
      ALL_USERS: Array(6).fill(0),
      VENUE_OWNER: Array(6).fill(0),
      SERVICE_PROVIDER: Array(6).fill(0),
      EVENT_PLANNER: Array(6).fill(0),
    };

    // Count users per month per role
    for (const user of users) {
      const createdAt = new Date(user.createdAt);
      const label = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      const idx = monthIndexMap[label];
      if (idx !== undefined) {
        data.ALL_USERS[idx] += 1;
        if (user.role.includes('VENUE_OWNER')) data.VENUE_OWNER[idx] += 1;
        if (user.role.includes('SERVICE_PROVIDER'))
          data.SERVICE_PROVIDER[idx] += 1;
        if (user.role.includes('PLANNER')) data.EVENT_PLANNER[idx] += 1;
      }
    }

    return {
      months: labels,
      data,
    };
  }

  async getUserRoleDistribution():Promise<ApiResponse<any>> {
    // Count total users for each role
    const [venueOwners, serviceProviders, eventPlanners] = await Promise.all([
      this.db.user.count({
        where: {
          role: {
            has: UserRole.VENUE_OWNER,
          },
        },
      }),
      this.db.user.count({
        where: { role: { has: UserRole.SERVICE_PROVIDER } },
      }),
      this.db.user.count({ where: { role: { has: UserRole.PLANNER } } }),
    ]);

    const total = venueOwners + serviceProviders + eventPlanners || 1;

    return {
      data: [
      {
        role: 'Venue Owner',
        count: venueOwners,
        percentage: ((venueOwners / total) * 100).toFixed(1),
      },
      {
        role: 'Service Provider',
        count: serviceProviders,
        percentage: ((serviceProviders / total) * 100).toFixed(1),
      },
      {
        role: 'Event Planner',
        count: eventPlanners,
        percentage: ((eventPlanners / total) * 100).toFixed(1),
      },
    ],
      message: 'User role distribution fetched successfully',
      statusCode: 200,
      success: true,
    }
  }
}
