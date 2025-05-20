import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { IdDto } from 'src/common/dto/id.dto';
  import { ApiResponse } from 'src/interfaces/response';
  import { DbService } from 'src/lib/db/db.service';

  import { v4 as uuid } from 'uuid';
  

  import { UploadService } from 'src/lib/upload/upload.service';
import { AuthService } from 'src/main/auth/services/auth.service';

  
  @Injectable()
  export class GuestLinkService {
    constructor(
      private readonly dbService: DbService,
      private readonly authService: AuthService,
      private uploadService: UploadService,
    ) {}
  
    public async generateMagicLink({ id }: IdDto): Promise<ApiResponse<any>> {
      const booking = await this.dbService.booking.findUnique({
        where: { id },
      });
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
  
      const magicLink = await this.dbService.magicLink.create({
        data: {
          magicLinkId: uuid(),
          Booking: {
            connect: { id },
          },
        },
      });
  
      return {
        data: {
          url: `/guest/magic-link/verify?id=${magicLink.magicLinkId}`,
          magicLinkId: magicLink.magicLinkId,
        },
        message: 'Magic link generated successfully',
        statusCode: 200,
        success: true,
      };
    }
  
    public async verifyMagicLink({ id }: IdDto): Promise<ApiResponse<any>> {
      const magicLink = await this.dbService.magicLink.findUnique({
        where: { magicLinkId: id },
        include: {
          Profile: {
            include: {
              user: true,
            },
          },
        },
      });
  
      if (!magicLink) {
        throw new NotFoundException('Magic link not found');
      }
  
      if (!magicLink.Profile) {
        throw new NotFoundException('Profile not found');
      }
  
      const token = await this.authService.generateToken({
        email: magicLink.Profile.user.email,
        roles: magicLink.Profile.user.role,
        id: magicLink.Profile.user.id,
        isVerified: magicLink.Profile.user.isVerified,
        profileId: magicLink.Profile.id,
      });
  
      return {
        data: {
          access_token: token,
          user: magicLink.Profile,
        },
        message: 'Magic link verified successfully',
        statusCode: 200,
        success: true,
      };
    }
  
  
  }
  