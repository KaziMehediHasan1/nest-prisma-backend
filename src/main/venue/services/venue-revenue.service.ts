import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class VenueRevenueService {
  constructor(private readonly db: DbService) {}

  async getVenueMetrics(venueId: string) {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
    const endOfPreviousMonth = endOfMonth(subMonths(now, 1));

    const [
      totalRevenueRes,
      currentMonthRevenueRes,
      previousMonthRevenueRes,
      pendingBookings,
    ] = await Promise.all([
      // Total revenue
      this.db.payment.aggregate({
        _sum: { amount: true },
        where: {
          bookingInfo: {
            venueId,
          },
        },
      }),

      // Current month revenue
      this.db.payment.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
          },
          bookingInfo: { venueId },
        },
      }),

      // Previous month revenue
      this.db.payment.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: {
            gte: startOfPreviousMonth,
            lte: endOfPreviousMonth,
          },
          bookingInfo: { venueId },
        },
      }),

      // Pending bookings
      this.db.booking.count({
        where: {
          venueId,
          bookingStatus: 'PENDING', // adjust this if your enum name differs
        },
      }),
    ]);

    const totalRevenue = totalRevenueRes._sum.amount ?? 0;
    const currentRevenue = currentMonthRevenueRes._sum.amount ?? 0;
    const previousRevenue = previousMonthRevenueRes._sum.amount ?? 0;

    const growthRate =
      previousRevenue === 0
        ? currentRevenue > 0
          ? 100
          : 0
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      totalRevenue,
      currentMonthRevenue: currentRevenue,
      growthRate: Number(growthRate.toFixed(2)),
      pendingBookings,
    };
  }
}
