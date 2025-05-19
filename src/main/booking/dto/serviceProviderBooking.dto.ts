import { IsUUID, IsDateString, IsInt, Min, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceProviderBookingDto {
  @ApiProperty({
    description: 'ID of the service provider',
    example: 'b6fa1dc7-3a33-4eb2-948c-9f37c0e6ae4a',
  })
  @IsUUID()
  serviceProviderId: string;

  @ApiProperty({
    description: 'ID of the event type (references EventType table)',
    example: 'd5b394a1-51f3-4c28-91ec-06e993e457b3',
  })
  @IsUUID()
  eventTypeId: string;

  @ApiProperty({
    description: 'Date of the booking (YYYY-MM-DD format)',
    example: '2024-06-24T09:00:00Z',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Start time of the event (ISO 8601 format)',
    example: '2024-06-24T09:00:00Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'End time of the event (ISO 8601 format)',
    example: '2024-06-24T12:00:00Z',
  })
  @IsDateString()
  endTime: string;

  @ApiProperty({
    description: 'Number of guests attending',
    example: 150,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  numberOfGuests: number;

  @ApiProperty({ description: 'Event name' })
  @IsString()
  @IsNotEmpty()
  eventName: string;

    @ApiProperty({ description: 'Abdul Kader' })
  @IsString()
  @IsNotEmpty()
  plannerName: string;

  @ApiProperty({ description: 'Event location' })
  @IsString()
  @IsNotEmpty()
  location: string;
}
