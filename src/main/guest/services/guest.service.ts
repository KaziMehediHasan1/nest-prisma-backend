import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/interfaces/response';
import { DbService } from 'src/lib/db/db.service';
import { UtilService } from 'src/lib/util/util.service';
import { v4 as uuid } from 'uuid';
import { AuthService } from '../../auth/auth.service';
import { access } from 'fs';
import { CreateGuestDto } from '../dto/createGuest.dto';
import { UploadService } from 'src/lib/upload/upload.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { createGroupDto } from '../dto/createGroup.dto';

@Injectable()
export class GuestService {
  constructor(
    private readonly dbService: DbService,
    private readonly authService: AuthService,
    private uploadService: UploadService,
  ) {}



  public async createGuest(
    { id }: IdDto,
    rawData: CreateGuestDto,
  ): Promise<ApiResponse<any>> {
    const magicLink = await this.dbService.magicLink.findUnique({
      where: { magicLinkId: id },
    });

    if (!magicLink) {
      throw new NotFoundException('Magic link not found');
    }

    if (magicLink.profileId) {
      throw new ConflictException('Magic link already used');
    }

    const { image } = rawData;
    const fileInstance = await this.uploadService.uploadFile({
      file: image,
    });

    try {
      const guest = await this.dbService.user.create({
        data: {
          name: rawData.name,
          email: rawData.email,
          role: ['GUEST'],
          password: magicLink.id,
          isVerified: true,
          phone: rawData.phone,
          profile: {
            create: {
              gender: 'OTHER',
              location: rawData.location,
              magicLink: {
                connectOrCreate: {
                  where: { magicLinkId: magicLink.magicLinkId },
                  create: {
                    magicLinkId: magicLink.magicLinkId,
                  },
                },
              },
              image: {
                connect: {
                  id: fileInstance.id,
                },
              },
            },
          },
        },
        include: {
          profile: true,
        },
      });

      const token = await this.authService.generateToken({
        email: guest.email,
        roles: guest.role,
        id: guest.id,
        isVerified: guest.isVerified,
        profileId: guest.profile?.id || '',
      });

      return {
        data: {
          access_token: token,
          user: guest,
        },
        message: 'Guest created successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      await this.uploadService.deleteFile({
        Key: fileInstance.fileId,
      });

      throw new BadRequestException(
        Array.isArray(Error) ? error[0].message : error.message,
      );
    }
  }

  async getAllInvites(
    { id }: IdDto,
    pagination: PaginationDto,
  ): Promise<ApiResponse<any>> {
    {
      const invitation = await this.dbService.user.findMany({
        where: {
          profile: {
            magicLink: {
              bookingId: id,
            },
          },
        },
        take: pagination.take,
        skip: pagination.skip,
        orderBy: { createdAt: 'desc' },
      });

      return {
        data: invitation,
        message: 'Invites fetched successfully',
        statusCode: 200,
        success: true,
      };
    }
  }

  async createGroupByBookingId(
    id: IdDto,
    hostId: string,
    rawData: createGroupDto,
  ): Promise<ApiResponse<any>> {
    const { image, name } = rawData;
    const fileInstance = await this.uploadService.uploadFile({
      file: image,
    });
    try {
      const profiles = await this.dbService.profile.findMany({
        where: {
          magicLink: {
            bookingId: id.id,
          },
          user: {
            role: {
              equals: ['GUEST'],
            },
          },
        },
      });

      const allProfileIds = [
        ...profiles.map((profile) => ({ id: profile.id })),
        { id: hostId },
      ];

      const group = await this.dbService.groupMessage.create({
        data: {
          name,
          profiles: {
            connect: allProfileIds,
          },
          image: {
            connect: {
              id: fileInstance.id,
            },
          },
        },
        include: {
          profiles: true,
        },
      });

      return {
        data: group,
        message: 'Profiles fetched successfully',
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      this.uploadService.deleteFile({
        Key: fileInstance.fileId,
      });
      throw new BadRequestException(
        Array.isArray(Error) ? error[0].message : error.message,
      );
    }
  }
}
