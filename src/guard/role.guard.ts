import { 
    Injectable, 
    CanActivate, 
    ExecutionContext, 
    ForbiddenException 
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { $Enums } from '@prisma/client';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      // Get roles set on the handler using @Roles() decorator
      const requiredRoles = this.reflector.getAllAndOverride<$Enums.UserRole[]>('roles', [
        context.getHandler(),
        context.getClass()
      ]);
  
      // If no roles are specified, allow access
      if (!requiredRoles) {
        return true;
      }
  
      // Get the request from the context
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      // Check if user is authenticated
      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }
  
      // Check if user's role matches any of the required roles
      const hasRole = requiredRoles.some(role => user.role === role);
  
      if (!hasRole) {
        throw new ForbiddenException('Insufficient permissions');
      }
  
      return true;
    }
  }