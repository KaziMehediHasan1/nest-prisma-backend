import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { DbService } from 'src/lib/db/db.service';
import { UtilService } from 'src/lib/util/util.service';
import { ApiResponse } from 'src/interfaces/response';
import { VerificationService } from 'src/lib/verification/verification.service';
import { VerifyCodeDto } from '../dto/verifyEmail.dto';
import { ResetPasswordDto } from '../dto/resetPassword.dto';
import { SendResetCodeDto } from '../dto/sendResetCode.dto';

@Injectable()
export class AuthpasswordService {
  constructor(
    private readonly db: DbService,
    private readonly utilService: UtilService,
    private readonly verifyService: VerificationService,
  ) {}

  async verifyEmail({ code, identifier }: VerifyCodeDto) {
    const user = await this.db.user.findUnique({
      where: { email: identifier },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid verification code or email');
    }

    if (user.isVerified) {
      throw new ConflictException('Email is already verified');
    }

    const isCodeValid = await this.verifyService.verifyCode(identifier, code);

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.db.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    await this.verifyService.sendVerificationEmail(user.email, 5);

    return {
      statusCode: 200,
      success: true,
      message: 'Email verified successfully. You can now login.',
    };
  }

  async sendPasswordResetCode({
    email,
  }: SendResetCodeDto): Promise<ApiResponse<null>> {
    // Check if user exists
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException(
        'No account found with this email address',
        HttpStatus.NOT_FOUND,
      );
    }

    // Generate and send password reset code
    await this.verifyService.sendPasswordResetEmail(
      email,
      30, // 30 minutes expiration
      {
        username: user.name,
        applicationName: 'Your Application',
      },
    );

    return {
      statusCode: 200,
      success: true,
      message: 'Password reset code has been sent to your email',
      data: null,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<ApiResponse<null>> {
    const { email, newPassword, code } = dto;

    // Check if user exists
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException(
        'No account found with this email address',
        HttpStatus.NOT_FOUND,
      );
    }

    // Verify password reset code
    const isCodeValid = await this.verifyService.verifyCode(email, code);

    if (!isCodeValid) {
      throw new HttpException(
        'Invalid password reset code',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Hash the new password
    const hashedPassword = await this.utilService.hashPassword({
      password: newPassword,
      round: 10,
    });

    // Update the user's password
    await this.db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      statusCode: 200,
      success: true,
      message:
        'Password has been reset successfully. You can now login with your new password.',
      data: null,
    };
  }
}
