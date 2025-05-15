import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';
import { GetAllProfilesDto } from './dto/getUser.dto';
import { ApiResponse } from 'src/interfaces/response';

@Injectable()
export class UserService {
  constructor(private readonly db: DbService) {}

  async getAllProfiles({ isActive, skip, take, userRole }: GetAllProfilesDto):Promise<ApiResponse<any>> {
    const data = await this.db.profile.findMany({
      where: {
        user: {
          role: {
            has: userRole,
          }
        },
        ...(typeof isActive ? { isActive } : {}),
      },
      include: {
        user: true, // Optional: Include user info if needed
      },
      take,
      skip
    });

    return {
      data,
      message: 'Profiles fetched successfully',
      statusCode: 200,
      success: true,
    };
  }
}
