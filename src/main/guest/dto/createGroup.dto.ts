import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class createGroupDto{
      @ApiProperty({
        description: 'User full name',
        example: 'John Doe',
      })
      @IsString({ message: 'Name must be a string' })
      @MinLength(1, { message: 'Name must be at least 2 characters long' })
      @MaxLength(50, { message: 'Name cannot be longer than 50 characters' })
      name: string;

      @ApiProperty({
        description: 'Avatar image for the event preference',
        type: 'string',
        format: 'binary',
      })
      image: Express.Multer.File;
}