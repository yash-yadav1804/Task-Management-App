import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { generateRefreshToken, hashRefreshToken } from './auth.utils';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async createGuestUser() {
    const guestId = randomUUID();

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: 'Guest',
          email: `guest-${guestId}@guest.local`,
          isGuest: true,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: 'Guest Workspace',
          members: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
      });

      await tx.refreshToken.create({
        data: {
          tokenHash: refreshTokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        user,
        workspace,
      };
    });

    return {
      ...result,
      refreshToken,
    };
  }

  async getUserFromRefreshToken(token: string) {
    const tokenHash = hashRefreshToken(token);

    const session = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return session.user;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const tokenHash = hashRefreshToken(token);

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
