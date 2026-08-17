import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesService', () => {
  let workspacesService: WorkspacesService;

  const prismaMock = {
    workspaceMember: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    workspacesService = module.get<WorkspacesService>(WorkspacesService);
  });

  it('should be defined', () => {
    expect(workspacesService).toBeDefined();
  });
});
