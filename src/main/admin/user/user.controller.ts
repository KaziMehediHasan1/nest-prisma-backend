import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './services/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/role.guard';
import { VerifiedGuard } from 'src/guard/verify.guard';;
import { GetAllProfilesDto } from './dto/getUser.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { GetProfileService } from './services/get-profile.service';
import { AutUserhService } from 'src/main/auth/services/authuser.service';

@ApiTags('admin')
@Controller('user-management')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authuserservices: AutUserhService,
    private readonly getProfileService: GetProfileService,
  ) {}

  @Get('get-all-user')
  getAllUser(@Query() filter: GetAllProfilesDto) {
    return this.userService.getAllProfiles(filter);
  }

  @Post('suspend-user')
  suspendUser(@Query() id: IdDto) {
    return this.userService.suspendUser(id);
  }

  @Post('delete-user')
  deleteUser(@Query() { id }: IdDto) {
    return this.authuserservices.deleteUser(id);
  }

  @Get('get-profile/:id')
  unSuspendUser(@Param() id: IdDto) {
    return this.getProfileService.getProfile(id);
  }
}
