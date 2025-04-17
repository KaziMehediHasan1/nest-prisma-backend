import { Request } from 'express';
import { $Enums } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    roles: $Enums.UserRole[];
    isVerified: boolean;
    profileId?: string;
  };
}
