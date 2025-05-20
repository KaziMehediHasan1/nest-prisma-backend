import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { $Enums } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';
import { UtilService } from 'src/lib/util/util.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ApiResponse } from 'src/interfaces/response';
import { VerificationService } from 'src/lib/verification/verification.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DbService,
    private readonly utilService: UtilService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly verifyService: VerificationService,
  ) {}

  async register(dto: RegisterDto): Promise<
    ApiResponse<{
      access_token: string;
      user: {
        id: string;
        email: string;
        role: $Enums.UserRole[];
        isVerified: boolean;
        profileId: string;
      };
    }>
  > {
    const { roles, ...rest } = dto;
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
        role: roles,
      },
      include: {
        profile: true,
      },
    });

    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      roles: user.role,
      isVerified: user.isVerified,
      profileId: user.profile ? user.profile.id : '',
    });

    await this.verifyService.sendVerificationEmail(user.email);

    return {
      data: {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profileId: user.profile ? user.profile.id : '',
        },
      },
      statusCode: 201,
      success: true,
      message:
        'User registered successfully. A verification code has been sent, please verify your email.',
    };
  }

  async login(dto: LoginDto): Promise<
    ApiResponse<{
      access_token: string;
      user: {
        id: string;
        email: string;
        roles: $Enums.UserRole[];
        isVerified: boolean;
        profileId?: string;
        isProfileCreated: boolean;
      };
    }>
  > {
    // Find user by email
    const user = await this.db.user.findUnique({
      where: { email: dto.email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    // if (!user.isVerified) {
    //   await this.verifyService.sendVerificationEmail(user.email, 5);
    //   throw new HttpException(
    //     'A verification code has been sent to your email. Please verify your email',
    //     HttpStatus.UNAUTHORIZED,
    //   );
    // }

    // Verify password
    const isPasswordValid = await this.utilService.comparePassword({
      password: dto.password,
      hashedPassword: user.password,
    });

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate JWT token
    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      roles: user.role,
      isVerified: user.isVerified,
      profileId: user.profile ? user.profile.id : '',
    });

    return {
      data: {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          roles: user.role,
          isVerified: user.isVerified,
          profileId: user.profile ? user.profile.id : '',
          isProfileCreated: !!user.profile,
        },
      },
      statusCode: 200,
      message: 'Login Successful',
      success: true,
    };
  }

  public async generateToken(user: {
    id: string;
    email: string;
    roles: $Enums.UserRole[];
    isVerified: boolean;
    profileId: string;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roles,
      isVerified: user.isVerified,
      profileId: user.profileId,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: '7d',
    });
  }
}
