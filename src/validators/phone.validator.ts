import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    registerDecorator,
    ValidationOptions
  } from 'class-validator';
  import { isValidPhoneNumber } from 'libphonenumber-js';
  import parsePhoneNumber from 'libphonenumber-js'
  
  @ValidatorConstraint({ name: 'isValidPhone', async: false })
  export class IsValidPhoneConstraint implements ValidatorConstraintInterface {
    validate(phoneNumber: string, args?: ValidationArguments): boolean {
      try {
        // Early return for empty values
        if (!phoneNumber) return false;
  
        // Parse the phone number
        const parsedPhone = parsePhoneNumber(phoneNumber);
  
        // Ensure the number is valid
        if (!parsedPhone || !isValidPhoneNumber(phoneNumber)) return false;
  
        // If no constraints, allow all countries
        if (!args?.constraints?.length) return true;
  
        // Check if constraints include a special 'ANY' flag
        if (args.constraints.includes('ANY')) return true;
  
        // Check if the phone number's country matches any specified countries
        return args.constraints.includes(parsedPhone.country || '');
      } catch (error) {
        return false;
      }
    }
  
    defaultMessage(args?: ValidationArguments): string {
      return `Invalid phone number. Please provide a valid international phone number.`;
    }
  }
  
  // Custom decorator for phone number validation
  export function IsValidPhone(
    countries?: string[] | 'ANY',
    validationOptions?: ValidationOptions
  ) {
    // If 'ANY' is passed, convert to an array with 'ANY'
    const constraintCountries = countries === 'ANY' ? ['ANY'] : 
      (countries || []);
  
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: constraintCountries,
        validator: IsValidPhoneConstraint
      });
    };
  }