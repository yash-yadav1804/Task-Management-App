import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthService } from '../auth/auth.service';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';

describe('LabelsController', () => {
  let labelsController: LabelsController;

  const labelsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    addToTask: jest.fn(),
    removeFromTask: jest.fn(),
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
      controllers: [LabelsController],
      providers: [
        {
          provide: LabelsService,
          useValue: labelsServiceMock,
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

    labelsController = module.get<LabelsController>(LabelsController);
  });

  it('should be defined', () => {
    expect(labelsController).toBeDefined();
  });
});
