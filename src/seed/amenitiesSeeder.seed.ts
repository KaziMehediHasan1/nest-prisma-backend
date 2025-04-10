import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class AmenitiesSeeder implements OnModuleInit {
  private readonly logger = new Logger(AmenitiesSeeder.name);

  constructor(
    private readonly db: DbService,
  ) {}

  async onModuleInit() {
    await this.seedAmenities();
  }

  async seedAmenities() {
    const amenitiesData: Prisma.AmenitiesCreateInput[] = [
      { 
        name: 'Wifi', 
        default: true
      },
      { 
        name: 'Parking',
        default: true 
      },
      { 
        name: 'AC', 
        default: true
      },
      { 
        name: 'Pool',
        default: true 
      },
      { 
        name: 'Stage Lighting',
        default: true 
      },
      { 
        name: 'Sound System',
        default: true 
      },
      { 
        name: 'Bar Service',
        default: true 
      },
      { 
        name: 'Elevator',
        default: true 
      },
      { 
        name: 'Rest room',
        default: true 
      },
      { 
        name: 'Event_Staff',
        default: true 
      },
      { 
        name: 'In House Catering',
        default: true 
      }
    ];

    try {
      // Check if amenities already exist
      const existingAmenities = await this.db.amenities.findMany();
      
      if (existingAmenities.length === 0) {
        // Seed amenities if none exist
        await this.db.amenities.createMany({
          data: amenitiesData,
          skipDuplicates: true
        });
        
        this.logger.log('Amenities seeded successfully');
      } else {
        this.logger.log('Amenities already exist in the database');
      }
    } catch (error) {
      this.logger.error('Error seeding amenities', error);
      throw error;
    }
  }
}