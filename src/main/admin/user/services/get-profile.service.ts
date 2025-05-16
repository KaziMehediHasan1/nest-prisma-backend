import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/interfaces/response';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class GetProfileService {
  constructor(private readonly db: DbService) {}

  async getProfile({ id }: IdDto): Promise<ApiResponse<any>> {
    const profile = await this.db.profile.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const role = profile.user.role;

    // Base response
    const response: any = {
      ...profile,
    };

    if (role.includes(UserRole.SERVICE_PROVIDER)) {
      const [reviews, works] = await Promise.all([
        this.db.review.findMany({
          where: { profileId: profile.id },
          take: 2,
          orderBy: { createdAt: 'desc' },
        }),
        this.db.works.findMany({
          where: { profileId: profile.id },
          take: 6,
          orderBy: { id: 'desc' },
        }),
      ]);

      response.reviews = reviews;
      response.recentWorks = works;

      if (role.includes(UserRole.VENUE_OWNER)) {
        const venues = await this.db.venue.findMany({
          where: { profileId: profile.id },
          take: 3,
          orderBy: { createdAt: 'desc' },
        });

        response.recentVenues = venues;
      }
    }

    return {
      data: response,
      message: 'Profile fetched successfully',
      statusCode: 200,
      success: true,
    };
  }
}
