import {
  Injectable,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';

import { ApiResponse } from 'src/interfaces/response';

import { IdDto } from 'src/common/dto/id.dto';
import { EventService } from 'src/lib/event/event.service';

@Injectable()
export class AutUserhService {
  constructor(
    private readonly db: DbService,
    private readonly eventEmitter: EventService,
  ) {}

  public async deleteUser(id: string): Promise<ApiResponse<null>> {
    const user = await this.db.user.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            image: true,
            coverPhoto: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.profile?.image) {
      this.eventEmitter.emit('FILE_DELETE', {
        Key: user.profile.image.fileId,
      });
    }

    if (user.profile?.coverPhoto) {
      this.eventEmitter.emit('FILE_DELETE', {
        Key: user.profile.coverPhoto.fileId,
      });
    }

    await this.db.user.deleteMany({
      where: { id },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'User deleted successfully',
      data: null,
    };
  }

  public async GetUserInfo(id: IdDto): Promise<ApiResponse<any>> {
    const user = await this.db.user.findUnique({
      where: id,
      include: {
        profile: {
          include: {
            image: {
              select: {
                path: true,
              },
            },
            coverPhoto: {
              select: {
                path: true,
              },
            },
            eventPreference: {
              include: {
                avatar: {
                  select: {
                    path: true,
                  },
                },
              },
            },
            ServiceProviderType:{
              select:{
                name:true,
                id:true
              },
            }
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { password, ...rest } = user;

    return {
      statusCode: 200,
      success: true,
      message: 'User found successfully',
      data: rest,
    };
  }

  public async switchRoll({
    id,
    role,
  }: {
    id: string;
    role: $Enums.UserRole;
  }): Promise<ApiResponse<any>> {
    if (role === 'ADMIN') {
      throw new ForbiddenException('You cannot switch to admin role');
    }

    const user = await this.db.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.role.filter((r) => r === role).length === 0) {
      return {
        statusCode: 200,
        success: true,
        message: `please Create Profile to ${role} role`,
        data: {
          hasProfile: false,
          profile: user.profile,
        },
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: 'User found successfully',
      data: {
        hasProfile: true,
      },
    };
  }
}
