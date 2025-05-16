import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/role.guard';
import { VerifiedGuard } from 'src/guard/verify.guard';
import { filter } from 'rxjs';
import { GetAllProfilesDto } from './dto/getUser.dto';

@ApiTags("admin")
@Controller('user-management')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), VerifiedGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Get("get-all-user")
  getAllUser(@Query() filter: GetAllProfilesDto) {
    return this.userService.getAllProfiles(filter);
  }
}
