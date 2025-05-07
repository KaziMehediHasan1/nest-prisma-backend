import { Injectable, UseGuards } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { DbService } from 'src/lib/db/db.service';
import { CreateAminityDto } from './dto/create-aminity.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/guard/verify.guard';

@Injectable()
export class AmenitiesService {
    constructor(private readonly db:DbService) {}

    getAllAmenities() {
        return this.db.amenities.findMany();
    }

    getAmenityById(id: IdDto) {
        return this.db.amenities.findUnique({ where: id });
    }

    createAmenity(data: CreateAminityDto) {
        return this.db.amenities.create({ data });
    }

    deleteAmenity(id: IdDto) {
        return this.db.amenities.delete({ where: {
            id: id.id,
            default: false
        }});
    }
}
