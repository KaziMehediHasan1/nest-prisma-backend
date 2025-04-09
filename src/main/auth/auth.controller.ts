import { 
  Controller, 
  Post, 
  Body,
  Get, 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verifyEmail.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { SendResetCodeDto } from './dto/sendResetCode.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('send-password-reset-code')
  sendResetCode(@Body() email: SendResetCodeDto) {
    return this.authService.sendPasswordResetCode(email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}