import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { startOfMonth, subMonths, format } from 'date-fns';
import { ApiResponse } from 'src/interfaces/response';

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

  async returnAnalytics(): Promise<ApiResponse<any>> {
    const totalUsers = await this.getTotalUsers();
    const activeVenues = await this.getActiveVenues();
    const monthlyRevenue = await this.getMonthlyRevenue();
    const monthlyBookingTrends = await this.getMonthlyBookingTrends();
    const monthlyEarningTrends = await this.getMonthlyEarningTrends();
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
}
