import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateReviewDto } from '../dto/createReview.dto';
import { ApiResponse } from 'src/interfaces/response';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly db: DbService) {}

  public async createReview(
    rawData: CreateReviewDto,
  ): Promise<ApiResponse<any>> {
    try {
      const { profileId, venueId, ...rest } = rawData;
      const review = await this.db.review.create({
        data: {
          ...(profileId && {
            Profile: {
              connect: {
                id: profileId,
              },
            },
          }),
          ...(venueId && {
            Venue: {
              connect: {
                id: venueId,
              },
            },
          }),
          ...rest,
        },
      });

      return {
        success: true,
        data: review,
        message: 'Review created successfully',
        statusCode: 200,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAllReviews(
    id: IdDto,
    type: 'venue' | 'profile',
    { skip, take }: PaginationDto,
  ): Promise<ApiResponse<any>> {
    // Define the where condition based on type
    const whereCondition =
      type === 'venue' ? { Venue: { id: id.id } } : { Profile: { id: id.id } };

    // Get paginated reviews
    const reviews = await this.db.review.findMany({
      where: whereCondition,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        Profile: {
          select: {
            name: true,
            image: {
              select: {
                path: true,
              },
            },
          },
        },
      },
    });

    // Get average rating
    const avgRating = await this.db.review.aggregate({
      where: whereCondition,
      _avg: {
        rating: true,
      },
    });

    // Get count for each rating value (5, 4, 3, 2, 1)
    const ratingsCount = await Promise.all(
      [5, 4, 3, 2, 1].map(async (rating) => {
        const count = await this.db.review.count({
          where: {
            ...whereCondition,
            rating,
          },
        });
        return { rating, count };
      }),
    );

    // Get total count of reviews
    const totalReviews = await this.db.review.count({
      where: whereCondition,
    });

    return {
      success: true,
      data: {
        reviews,
        stats: {
          averageRating: avgRating._avg.rating || 0,
          totalReviews,
          ratingsBreakdown: ratingsCount,
        },
      },
      message: 'Reviews fetched successfully',
      statusCode: 200,
    };
  }
  async getAllVenueOwnerReviews(
    ownerId: string,
    { take, skip }: PaginationDto,
  ): Promise<ApiResponse<any>> {
    // Step 1: Get all venues owned by the user
    const venues = await this.db.venue.findMany({
      where: {
        Profile: {
          id: ownerId,
        },
      },
      select: {
        id: true,
        name: true,
      },
      take,
      skip,
    });

    const venueIds = venues.map((v) => v.id);

    if (venueIds.length === 0) {
      return {
        data: [],
        message: 'No venues found',
        statusCode: 200,
        success: true,
      };
    }

    // Step 2: Get all reviews for those venues
    const reviews = await this.db.review.findMany({
      where: {
        venueId: {
          in: venueIds,
        },
      },
      include: {
        Venue: {
          select: {
            name: true,
          },
        },
        Profile: {
          select: {
            name: true,
            image:{
              select:{
                path:true
              }
            } // or email or username
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const data = await reviews.map((review) => ({
      id: review.id,
      content: review.comment,
      rating: review.rating,
      venueName: review.Venue?.name,
      userName: review.Profile?.name,
      createdAt: review.createdAt,
      userImage: review.Profile?.image?.path?? null
    }));

    return {
      data,
      message: 'Reviews fetched successfully',
      statusCode: 200,
      success: true,
    };
  }
}
