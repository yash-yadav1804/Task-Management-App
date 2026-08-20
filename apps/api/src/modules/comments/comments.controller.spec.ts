import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthService } from '../auth/auth.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let commentsController: CommentsController;

  const commentsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  const authServiceMock = {
    getUserFromRefreshToken: jest.fn(),
  };

  const authGuardMock = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: commentsServiceMock,
        },
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: AuthGuard,
          useValue: authGuardMock,
        },
      ],
    }).compile();

    commentsController = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(commentsController).toBeDefined();
  });
});
