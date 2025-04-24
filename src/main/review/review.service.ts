import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateReviewDto } from './dto/createReview.dto';
import { ApiResponse } from 'src/interfaces/response';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ReviewService {
    constructor(
        private readonly db:DbService
    ){}

    public async createReview(rawData: CreateReviewDto): Promise<ApiResponse<any>>{
        const {
            profileId, 
            venueId,
            ...rest
        } = rawData
        const review = await this.db.review.create({
            data:{
                ...(profileId && {
                    Profile:{
                        connect:{
                            id:profileId
                        }
                    }
                }),
                ...(venueId && {
                    Venue:{
                        connect:{
                            id:venueId
                        }
                    }
                }),
                ...rest
            }
        })

        return {
            success: true,
            data: review,
            message: 'Review created successfully',
            statusCode: 200
        }
    }

    async getAllReviews(id: IdDto, type:"venue" | "profile", {
        skip,
        take
    }:PaginationDto):Promise<ApiResponse<any>>{
        const reviews = await this.db.review.findMany({
            where: {
                ...(type === "venue" && {
                    Venue: {
                        id: id.id
                    }
                }),
                ...(type === "profile" && {
                    Profile: {
                        id: id.id
                    }
                })
            },
            skip,
            take
        })
        return {
            success: true,
            data: reviews,
            message: 'Reviews fetched successfully',
            statusCode: 200
        }
    }
}
