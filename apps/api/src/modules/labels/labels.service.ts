import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LabelsService {
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

  async create(userId: string, workspaceId: string, name: string) {
    await this.assertWorkspaceMember(userId, workspaceId);

    try {
      return await this.prisma.label.create({
        data: {
          workspaceId,
          name: name.trim(),
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Unique constraint')
      ) {
        throw new ConflictException(
          'A label with this name already exists in the workspace',
        );
      }

      throw error;
    }
  }

  async findAll(userId: string, workspaceId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);

    return this.prisma.label.findMany({
      where: {
        workspaceId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async addToTask(
    userId: string,
    workspaceId: string,
    taskId: string,
    labelId: string,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);

    await this.assertTaskInWorkspace(workspaceId, taskId);

    const label = await this.prisma.label.findFirst({
      where: {
        id: labelId,
        workspaceId,
      },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return this.prisma.taskLabel.create({
      data: {
        taskId,
        labelId,
      },
      include: {
        label: true,
      },
    });
  }

  async removeFromTask(
    userId: string,
    workspaceId: string,
    taskId: string,
    labelId: string,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);

    await this.assertTaskInWorkspace(workspaceId, taskId);

    const relation = await this.prisma.taskLabel.findUnique({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });

    if (!relation) {
      throw new NotFoundException('Task label relationship not found');
    }

    await this.prisma.taskLabel.delete({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });

    return {
      success: true,
    };
  }
}
