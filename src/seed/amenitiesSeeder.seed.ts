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
      },
      { 
        name: 'Parking', 
      },
      { 
        name: 'AC', 
      },
      { 
        name: 'Pool', 
      },
      { 
        name: 'Stage_Lighting', 
      },
      { 
        name: 'Sound_System', 
      },
      { 
        name: 'Bar_Service', 
      },
      { 
        name: 'Elevator', 
      },
      { 
        name: 'Rest_room', 
      },
      { 
        name: 'Event_Staff', 
      },
      { 
        name: 'In_House_Catering', 
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