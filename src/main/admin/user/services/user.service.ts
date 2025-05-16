import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';
import { GetAllProfilesDto } from '../dto/getUser.dto';
import { ApiResponse } from 'src/interfaces/response';
import { IdDto } from 'src/common/dto/id.dto';

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
      ...(isActive !== undefined ? { active: isActive } : {}),
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

  public async suspendUser({ id }: IdDto): Promise<ApiResponse<any>> {
    const user = await this.db.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data = await this.db.user.update({
      where: {
        id,
      },
      data: {
        profile: {
          update: {
            susPend: true,
          },
        },
      },
    });

    return {
      data,
      message: 'User suspended successfully',
      statusCode: 200,
      success: true,
    };
  }
}
