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
        if (!phoneNumber) return false;
  
        const parsedPhone = parsePhoneNumber(phoneNumber);
  
        if (!parsedPhone || !isValidPhoneNumber(phoneNumber)) return false;
  
        if (!args?.constraints?.length) return true;
  
        if (args.constraints.includes('ANY')) return true;
  
        return args.constraints.includes(parsedPhone.country || '');
      } catch (error) {
        return false;
      }
    }
  
    defaultMessage(args?: ValidationArguments): string {
      return `Invalid phone number. Please provide a valid international phone number.`;
    }
  }
  
  export function IsValidPhone(
    countries?: string[] | 'ANY',
    validationOptions?: ValidationOptions
  ) {
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