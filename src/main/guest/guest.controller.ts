import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GuestService } from './services/guest.service';
import { IdDto } from 'src/common/dto/id.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateGuestDto } from './dto/createGuest.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { createGroupDto } from './dto/createGroup.dto';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';
import { GuestLinkService } from './services/guestLink.service';

@Controller('guest')
export class GuestController {
  constructor(
    private readonly guestService: GuestService,
    private readonly gestlinkService:GuestLinkService
  
  ) {}

  @Get('magic-link/generate')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles('PLANNER')
  @ApiOperation({ summary: 'Generate magic link for a specific booking' })
  async generateMagicLink(@Query() id: IdDto) {
    return this.gestlinkService.generateMagicLink(id);
  }

  @Get('magic-link/verify')
  async verifyMagicLink(@Query() id: IdDto) {
    return this.gestlinkService.verifyMagicLink(id);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data', 'application/json')
  async createGuest(
    @Query() id: IdDto,
    @UploadedFile() image: Express.Multer.File,
    @Body() data: CreateGuestDto,
  ) {
    const rawData = {
      ...data,
      image,
    };
    return this.guestService.createGuest(id, rawData);
  }

  @Get('invites/:id')
  @ApiOperation({ summary: 'Get all invites for a specific booking' })
  async getAllInvites(@Param() id: IdDto, @Query() pagination: PaginationDto) {
    return this.guestService.getAllInvites(id, pagination);
  }

  @Post('create-group')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles('PLANNER')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data', 'application/json')
  async createGuestGroup(
    @UploadedFile() image: Express.Multer.File,
    @Body() data: createGroupDto,
    @Query() id: IdDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const rawData = {
      ...data,
      image,
    };

    return this.guestService.createGroupByBookingId(
      id,
      req.user.profileId ? req.user.profileId : '',
      rawData,
    );
  }
}
