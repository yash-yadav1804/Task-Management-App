import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertWorkspaceMember(userId: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return membership;
  }

  private async assertLeadBelongsToWorkspace(
    workspaceId: string,
    leadId: string,
  ) {
    const leadMembership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: leadId,
        },
      },
    });

    if (!leadMembership) {
      throw new BadRequestException(
        'Project lead must belong to the workspace',
      );
    }
  }

  async create(userId: string, workspaceId: string, dto: CreateProjectDto) {
    await this.assertWorkspaceMember(userId, workspaceId);

    if (dto.leadId) {
      await this.assertLeadBelongsToWorkspace(workspaceId, dto.leadId);
    }

    return this.prisma.project.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        leadId: dto.leadId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        lead: true,
      },
    });
  }

  async findAll(userId: string, workspaceId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);

    return this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      include: {
        lead: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, workspaceId: string, projectId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
      },
      include: {
        lead: true,
        tasks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(
    userId: string,
    workspaceId: string,
    projectId: string,
    dto: UpdateProjectDto,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);

    const existingProject = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
      },
    });

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    if (dto.leadId) {
      await this.assertLeadBelongsToWorkspace(workspaceId, dto.leadId);
    }

    return this.prisma.project.update({
      where: {
        id: existingProject.id,
      },
      data: {
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        leadId: dto.leadId,
        dueDate: dto.dueDate !== undefined ? new Date(dto.dueDate) : undefined,
      },
      include: {
        lead: true,
      },
    });
  }

  async remove(userId: string, workspaceId: string, projectId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);

    const existingProject = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
      },
    });

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.delete({
      where: {
        id: existingProject.id,
      },
    });

    return {
      success: true,
    };
  }
}
