import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class ReviewService {
    constructor(
        private readonly db:DbService
    ){}
}
