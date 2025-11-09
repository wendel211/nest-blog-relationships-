import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/user.entity';

/**
 * Current User Decorator
 * 
 * Extracts the authenticated user from the request object
 * Usage: @CurrentUser() user: User
 * 
 * Must be used in conjunction with JwtAuthGuard
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
