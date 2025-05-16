import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly db: DbService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: { 
    sub: string, 
    email: string, 
    roles: string ,
    profileId: string
  }) {
    
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    
    
    const isExist = await this.db.user.findUnique({
      where: { 
        id: payload.sub,
        email: payload.email,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        profile:true,
        
      }
    });

    if (!isExist) {
      throw new UnauthorizedException('User not found');
    }

    if(isExist.profile?.susPend){
      throw new UnauthorizedException('User is suspended');
    }

    const user = {
      ...payload
    }
    return user;
  }
}