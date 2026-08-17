import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './current-user.decorator';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

function getRefreshToken(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const token = cookies?.[REFRESH_TOKEN_COOKIE];

  return typeof token === 'string' ? token : undefined;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('guest')
  async guestLogin(@Res({ passthrough: true }) res: Response) {
    const result = await this.authService.createGuestUser();

    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
      workspace: result.workspace,
    };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(
    @CurrentUser()
    user: Awaited<ReturnType<AuthService['getUserFromRefreshToken']>>,
  ) {
    return { user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = getRefreshToken(req);

    if (token) {
      await this.authService.revokeRefreshToken(token);
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      success: true,
    };
  }
}
