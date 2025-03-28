import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LibModule } from './lib/lib.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MainModule } from './main/main.module';
import { AdminSeeder } from './seed/admin.seed';
import { AmenitiesSeeder } from './seed/amenitiesSeeder.seed';

@Module({
  controllers: [AppController],
  providers: [
    AppService, 
    AdminSeeder,
    AmenitiesSeeder
  ],
  imports: [
    LibModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MainModule,
  ],
})
export class AppModule {}
