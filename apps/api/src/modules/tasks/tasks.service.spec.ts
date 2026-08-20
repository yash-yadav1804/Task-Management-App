import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let tasksService: TasksService;

  const prismaMock = {
    workspaceMember: {
      findUnique: jest.fn(),
    },
    project: {
      findFirst: jest.fn(),
    },
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });
});
