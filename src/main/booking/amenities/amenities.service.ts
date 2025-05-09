import { BadRequestException, Injectable, Req, UseGuards } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { DbService } from 'src/lib/db/db.service';
import { CreateAminityDto } from './dto/create-aminity.dto';


@Injectable()
export class AmenitiesService {
  constructor(private readonly db: DbService) {}

  getAllAmenities({id}: IdDto) {
    return this.db.amenities.findMany({
        where: {
          OR: [
            { profileId: id },
            { default: true }
          ]
        },
        orderBy: {
          name: 'asc' // Optional: Order the results
        }
      });
  }

  getAmenityById(id: IdDto) {
    return this.db.amenities.findUnique({ where: id });
  }

  createAmenity({ id }: IdDto, rawData: CreateAminityDto) {
    try {
        return this.db.amenities.create({
            data: {
              ...rawData,
              Profile: {
                connect: { id },
              },
            },
          });
    } catch (error) {
        throw new BadRequestException(`unable to create amenity\n${error}`);
    }
  }

  deleteAmenity(id: IdDto) {
    return this.db.amenities.delete({
      where: {
        id: id.id,
        default: false,
      },
    });
  }
}
