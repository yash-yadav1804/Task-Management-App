import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

type AuthenticatedRequest = Request & {
  user?: Awaited<ReturnType<AuthService['getUserFromRefreshToken']>>;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const cookies = request.cookies as Record<string, unknown> | undefined;
    const token = cookies?.[REFRESH_TOKEN_COOKIE];

    if (typeof token !== 'string' || token.length === 0) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.authService.getUserFromRefreshToken(token);

    request.user = user;

    return true;
  }
}
