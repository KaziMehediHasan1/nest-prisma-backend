import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileVerificationService } from './profile-verification.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';
import { CreateVerificationRequestDto } from './dto/createVerificationRequest.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
@Controller('profile-verification')
export class ProfileVerificationController {
  constructor(
    private readonly profileVerificationService: ProfileVerificationService,
  ) {}

  @Post('send-verification-request')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'idCard', maxCount: 1 },
      { name: 'tradeLicense', maxCount: 1 },
    ]),
  )
  @Roles('SERVICE_PROVIDER', 'VENUE_OWNER')
  @ApiConsumes('multipart/form-data', 'application/json')
  sendVerificationRequest(
    @UploadedFiles()
    files: {
      idCard: Express.Multer.File[];
      tradeLicense: Express.Multer.File[];
    },
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateVerificationRequestDto,
  ) {
    const data: CreateVerificationRequestDto = {
      idCard: files.idCard[0],
      tradeLicense: files.tradeLicense[0],
      profileId: req.user.profileId || '',
      bio: body.bio,
    };
    return this.profileVerificationService.sendVerificationRequest(data);
  }

  @Get('get-all-verification-requests')
  @Roles('ADMIN')
  getAllVerificationRequests(@Query() pagination: PaginationDto) {
    return this.profileVerificationService.getAllVerificationRequests(pagination);
  }
}
