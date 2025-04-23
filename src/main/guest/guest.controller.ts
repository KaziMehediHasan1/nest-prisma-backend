import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GuestService } from './guest.service';
import { IdDto } from 'src/common/dto/id.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateGuestDto } from './dto/createGuest.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get('magic-link/generate')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
  @Roles("PLANNER")
  async generateMagicLink(@Query() id: IdDto) {
    return this.guestService.generateMagicLink(id);
  }

  @Get('magic-link/verify')
  async verifyMagicLink(@Query() id: IdDto) {
    return this.guestService.verifyMagicLink(id);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data', 'application/json')
  async createGuest(
    @Query()  id : IdDto,
    @UploadedFile() image: Express.Multer.File,
    @Body() data: CreateGuestDto
  ) {
    const rawData = {
      ...data,
      image,
    }
    return this.guestService.createGuest(id, rawData);
  }


  @Get('invites/:id')
  @ApiOperation({summary: 'Get all invites for a specific booking'})
  async getAllInvites(@Param() id: IdDto, @Query() pagination: PaginationDto) {
    return this.guestService.getAllInvites(id, pagination);
  }
  
}
