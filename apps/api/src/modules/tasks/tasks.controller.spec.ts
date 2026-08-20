import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthService } from '../auth/auth.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let tasksController: TasksController;

  const tasksServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
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
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: tasksServiceMock,
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

    tasksController = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(tasksController).toBeDefined();
  });
});
