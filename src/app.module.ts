import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LibModule } from './lib/lib.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MainModule } from './main/main.module';
import { AdminSeeder } from './seed/admin.seed';
import { AmenitiesSeeder } from './seed/amenitiesSeeder.seed';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';


@Module({
  controllers: [AppController],
  providers: [
    AppService, 
    AdminSeeder,
    AmenitiesSeeder,
    JwtStrategy,
  ],
  
  imports: [
    LibModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),
    MainModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }
      }),
      inject: [ConfigService]
    }),

    EventEmitterModule.forRoot(),
    
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.getOrThrow('REDIS_HOST', 'localhost'),
        port: configService.getOrThrow('REDIS_PORT', 6379),
        password: configService.getOrThrow('REDIS_PASSWORD', undefined),
      }),
    }),
  ],
  exports: [JwtStrategy]
})
export class AppModule {}
