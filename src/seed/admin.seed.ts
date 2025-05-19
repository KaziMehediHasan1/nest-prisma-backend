import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';
import { UtilService } from 'src/lib/util/util.service';

@Injectable()
export class AdminSeeder implements OnModuleInit {
  private readonly logger = new Logger(AdminSeeder.name);
  constructor(
    private readonly config: ConfigService,
    private readonly lib: UtilService,
    private readonly db: DbService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminExists = await this.db.user.findFirst({
      where: {
        role:{
          has:$Enums.UserRole.ADMIN
        },
      },
    });
    
    if (!adminExists) {
      const hashedPassword = await this.lib.hashPassword({
        password: this.config.getOrThrow('ADMIN_PASSWORD') as string,
        round: 6,
      });
      await this.db.user.create({
        data: {
          email: this.config.getOrThrow('ADMIN_EMAIL') as string,
          name: this.config.getOrThrow('ADMIN_NAME') as string,
          password: hashedPassword,
          role: [$Enums.UserRole.ADMIN],
          phone: this.config.getOrThrow('ADMIN_PHONE') as string,
          isVerified: true,
          profile:{
            create:{
              gender:"MALE",
              location:"N/A"
            }
          }
        },
      });
      this.logger.log('Super Admin user created successfully.');
    } else {
      this.logger.log('Super Admin user already exists.');
    }
  }
}
