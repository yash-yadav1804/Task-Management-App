import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;

  const authServiceMock = {
    createGuestUser: jest.fn(),
    getUserFromRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('guestLogin', () => {
    it('creates a guest session response', async () => {
      const response = {
        cookie: jest.fn(),
      };

      authServiceMock.createGuestUser.mockResolvedValue({
        user: {
          id: 'user-id',
          name: 'Guest',
          email: 'guest@test.local',
          isGuest: true,
        },
        workspace: {
          id: 'workspace-id',
          name: 'Guest Workspace',
        },
        refreshToken: 'refresh-token',
      });

      const result = await authController.guestLogin(response as never);

      expect(result).toEqual({
        user: {
          id: 'user-id',
          name: 'Guest',
          email: 'guest@test.local',
          isGuest: true,
        },
        workspace: {
          id: 'workspace-id',
          name: 'Guest Workspace',
        },
      });

      expect(response.cookie).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('revokes the token and clears the cookie', async () => {
      const request = {
        cookies: {
          refresh_token: 'refresh-token',
        },
      };

      const response = {
        clearCookie: jest.fn(),
      };

      authServiceMock.revokeRefreshToken.mockResolvedValue(undefined);

      const result = await authController.logout(
        request as never,
        response as never,
      );

      expect(result).toEqual({
        success: true,
      });

      expect(authServiceMock.revokeRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );

      expect(response.clearCookie).toHaveBeenCalledTimes(1);
    });
  });
});
