import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthService } from '../auth/auth.service';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

describe('ResourcesController', () => {
  let resourcesController: ResourcesController;

  const resourcesServiceMock = {
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
      controllers: [ResourcesController],
      providers: [
        {
          provide: ResourcesService,
          useValue: resourcesServiceMock,
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

    resourcesController = module.get<ResourcesController>(ResourcesController);
  });

  it('should be defined', () => {
    expect(resourcesController).toBeDefined();
  });
});
