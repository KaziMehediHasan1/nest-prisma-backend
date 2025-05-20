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
import { BullModule } from '@nestjs/bullmq';
import { QueuesModule } from './queues/queues.module';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    AdminSeeder,
    AmenitiesSeeder,
    JwtStrategy,
    AdminSeeder,
    AmenitiesSeeder,
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
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService], // <- this line is required
      useFactory: async (configService: ConfigService) => {
        const host = configService.getOrThrow<string>('REDIS_HOST');
        const port = configService.getOrThrow<string>('REDIS_PORT');
        
        return {
          connection: {
            host,
            port:parseInt(port, 10),
          },
        };
      },
    }),

    EventEmitterModule.forRoot(),

    CacheModule.register({
      isGlobal: true,
    }),

    QueuesModule,
  ],
  exports: [JwtStrategy],
})
export class AppModule {}
