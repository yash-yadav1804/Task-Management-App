import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { ResourcesService } from './resources.service';

describe('ResourcesService', () => {
  let resourcesService: ResourcesService;

  const prismaMock = {
    workspaceMember: {
      findUnique: jest.fn(),
    },
    task: {
      findFirst: jest.fn(),
    },
    taskResource: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    resourcesService = module.get<ResourcesService>(ResourcesService);
  });

  it('should be defined', () => {
    expect(resourcesService).toBeDefined();
  });
});
