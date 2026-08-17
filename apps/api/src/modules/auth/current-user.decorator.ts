import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

type AuthenticatedRequest = Request & {
  user?: Awaited<ReturnType<AuthService['getUserFromRefreshToken']>>;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);
