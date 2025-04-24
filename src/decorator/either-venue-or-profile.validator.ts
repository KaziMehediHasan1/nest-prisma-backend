import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
  
  @ValidatorConstraint({ name: 'EitherVenueOrProfile', async: false })
  export class EitherVenueOrProfile implements ValidatorConstraintInterface {
    validate(_: any, args: ValidationArguments) {
      const { venueId, profileId } = args.object as any;
      return (
        (venueId && !profileId) ||
        (!venueId && profileId)
      );
    }
  }