import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthService } from '../auth/auth.service';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesController', () => {
  let workspacesController: WorkspacesController;

  const workspacesServiceMock = {
    getUserWorkspaces: jest.fn(),
    getWorkspaceById: jest.fn(),
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
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: workspacesServiceMock,
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

    workspacesController =
      module.get<WorkspacesController>(WorkspacesController);
  });

  it('should be defined', () => {
    expect(workspacesController).toBeDefined();
  });
});
