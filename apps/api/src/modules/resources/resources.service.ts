import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateResourceDto } from './create-resource.dto';

@Injectable()
export class ResourcesService {
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
  }

  private async assertTaskInWorkspace(workspaceId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(
    userId: string,
    workspaceId: string,
    taskId: string,
    dto: CreateResourceDto,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);
    await this.assertTaskInWorkspace(workspaceId, taskId);

    return this.prisma.taskResource.create({
      data: {
        taskId,
        title: dto.title.trim(),
        url: dto.url,
      },
    });
  }

  async findAll(userId: string, workspaceId: string, taskId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);
    await this.assertTaskInWorkspace(workspaceId, taskId);

    return this.prisma.taskResource.findMany({
      where: {
        taskId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(
    userId: string,
    workspaceId: string,
    taskId: string,
    resourceId: string,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);
    await this.assertTaskInWorkspace(workspaceId, taskId);

    const resource = await this.prisma.taskResource.findFirst({
      where: {
        id: resourceId,
        taskId,
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    await this.prisma.taskResource.delete({
      where: {
        id: resource.id,
      },
    });

    return {
      success: true,
    };
  }
}
