import { Controller, Post, Body, Req, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verifyEmail.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { SendResetCodeDto } from './dto/sendResetCode.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from 'src/common/types/RequestWithUser';
import { VerifyCodeOnlyDto } from './dto/verifyCode.dto';
import { VerificationService } from 'src/lib/verification/verification.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly VerificationService: VerificationService
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('resend-verification-code')
  async resendVerificationCode(@Body() dto: ResendVerifyCodeDto) {
    await this.VerificationService.generateVerificationCode(dto.email);
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

  @Post('verify-reset-code')
  verifyResetCode(@Body() dto: VerifyCodeOnlyDto) {
    return this.VerificationService.isCodeValid(dto);
  }

  @Delete('delete-account')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  deleteAccount(@Req() req: AuthenticatedRequest) {    
    return this.authService.deleteUser(req.user.sub);
  }
}
