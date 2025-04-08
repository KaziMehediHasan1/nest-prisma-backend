import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { $Enums } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';
import { UtilService } from 'src/lib/util/util.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiResponse } from 'src/interfaces/response';
import { VerificationService } from 'src/lib/verification/verification.service';
import { VerifyCodeDto } from './dto/verifyEmail.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { SendResetCodeDto } from './dto/sendResetCode.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DbService,
    private readonly utilService: UtilService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
   private readonly verifyService: VerificationService
  ) {}

  async register(dto: RegisterDto): Promise<
    ApiResponse<{
      access_token: string;
      user: {
        id: string;
        email: string;
        role: $Enums.UserRole;
        isVerified: boolean;
        profileId?: string;
      };
    }>
  > {
    const {gender, location, ...rest} = dto
    const existingUser = await this.db.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.utilService.hashPassword({
      password: dto.password,
      round: 10,
    });

    const user = await this.db.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        role: dto.role || $Enums.UserRole.PLANNER,
        profile:{
          create:{
            gender,
            location
          }
        }
      },
      include: {
        profile: true,
      },
    });

    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profileId: user.profile?.id,
    });

    await this.verifyService.sendVerificationEmail(user.email)

    return {
      data: {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profileId: user.profile?.id,
        },
      },
      statusCode: 201,
      success: true,
      message: 'User registered successfully. A verification code has been sent, please verify your email.',
    };
  }

  async login(dto: LoginDto) {
    // Find user by email
    const user = await this.db.user.findUnique({
      where: { email: dto.email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new HttpException("Please verify your email", HttpStatus.UNAUTHORIZED)
    }

    // Verify password
    const isPasswordValid = await this.utilService.comparePassword({
      password: dto.password,
      hashedPassword: user.password,
    });

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profileId: user.profile?.id,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  private async generateToken(user: {
    id: string;
    email: string;
    role: $Enums.UserRole;
    isVerified: boolean;
    profileId?: string;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: '7d',
    });
  }

  async verifyEmail({
    code,
    identifier
  }:VerifyCodeDto) {
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

  async sendPasswordResetCode({email}: SendResetCodeDto): Promise<ApiResponse<null>> {
    // Check if user exists
    const user = await this.db.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      throw new HttpException('No account found with this email address', HttpStatus.NOT_FOUND);
    }
  
    // Generate and send password reset code
    await this.verifyService.sendPasswordResetEmail(
      email,
      30, // 30 minutes expiration
      {
        username: user.name,
        applicationName: 'Your Application',
      }
    );
  
    return {
      statusCode: 200,
      success: true,
      message: 'Password reset code has been sent to your email',
      data: null,
    };
  }
  
  async resetPassword(dto: ResetPasswordDto): Promise<ApiResponse<null>> {
    const { email, code, newPassword } = dto;
  
    // Check if user exists
    const user = await this.db.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      throw new HttpException('No account found with this email address', HttpStatus.NOT_FOUND);
    }
  
    // Verify the reset code
    const isCodeValid = await this.verifyService.verifyCode(email, code);
  
    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid or expired reset code');
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
      message: 'Password has been reset successfully. You can now login with your new password.',
      data: null,
    };
  }

}
