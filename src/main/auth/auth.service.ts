import { 
    Injectable, 
    ConflictException, 
    UnauthorizedException 
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import { $Enums } from '@prisma/client';
  import { DbService } from 'src/lib/db/db.service';
  import { UtilService } from 'src/lib/util/util.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly db: DbService,
      private readonly utilService: UtilService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}
  
    async register(dto: RegisterDto) {
      const existingUser = await this.db.user.findUnique({
        where: { email: dto.email }
      });
  
      if (existingUser) {
        throw new ConflictException('User already exists');
      }
  
      const hashedPassword = await this.utilService.hashPassword({
        password: dto.password,
        round: 10
      });
  
      const user = await this.db.user.create({
        data: {
          ...dto,
          password: hashedPassword,
          role: dto.role || $Enums.UserRole.PLANNER
        }
      });
  
      const token = await this.generateToken(user);
  
      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    }
  
    async login(dto: LoginDto) {
      // Find user by email
      const user = await this.db.user.findUnique({
        where: { email: dto.email }
      });
  
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Verify password
      const isPasswordValid = await this.utilService.comparePassword({
        password: dto.password,
        hashedPassword: user.password
      });
  
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Generate JWT token
      const token = await this.generateToken(user);
  
      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    }
  
    private async generateToken(user: {
      id: string;
      email: string;
      role: $Enums.UserRole;
    }) {
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role
      };
  
      return this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: '7d'
      });
    }
  }