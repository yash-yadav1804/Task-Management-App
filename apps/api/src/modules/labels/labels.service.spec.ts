import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { LabelsService } from './labels.service';

describe('LabelsService', () => {
  let labelsService: LabelsService;

  const prismaMock = {
    workspaceMember: {
      findUnique: jest.fn(),
    },
    task: {
      findFirst: jest.fn(),
    },
    label: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    taskLabel: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabelsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    labelsService = module.get<LabelsService>(LabelsService);
  });

  it('should be defined', () => {
    expect(labelsService).toBeDefined();
  });
});
