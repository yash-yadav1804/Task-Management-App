import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

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

  private async assertProjectBelongsToWorkspace(
    workspaceId: string,
    projectId: string,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
      },
    });

    if (!project) {
      throw new BadRequestException(
        'Project does not belong to this workspace',
      );
    }

    return project;
  }

  private async assertUserBelongsToWorkspace(
    workspaceId: string,
    userId: string,
    fieldName: string,
  ) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new BadRequestException(
        `${fieldName} does not belong to this workspace`,
      );
    }
  }

  private async assertParentTaskBelongsToWorkspace(
    workspaceId: string,
    parentTaskId: string,
  ) {
    const parentTask = await this.prisma.task.findFirst({
      where: {
        id: parentTaskId,
        workspaceId,
      },
    });

    if (!parentTask) {
      throw new BadRequestException(
        'Parent task does not belong to this workspace',
      );
    }
  }

  async create(userId: string, workspaceId: string, dto: CreateTaskDto) {
    await this.assertWorkspaceMember(userId, workspaceId);

    if (dto.projectId) {
      await this.assertProjectBelongsToWorkspace(workspaceId, dto.projectId);
    }

    if (dto.reporterId) {
      await this.assertUserBelongsToWorkspace(
        workspaceId,
        dto.reporterId,
        'Reporter',
      );
    }

    if (dto.parentTaskId) {
      await this.assertParentTaskBelongsToWorkspace(
        workspaceId,
        dto.parentTaskId,
      );
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        workspaceId,
        projectId: dto.projectId,
        reporterId: dto.reporterId ?? userId,
        parentTaskId: dto.parentTaskId,
      },
      include: {
        project: true,
        reporter: true,
      },
    });
    await this.activityService.record(task.id, userId, 'CREATED');
    return task;
  }

  async findAll(userId: string, workspaceId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);

    return this.prisma.task.findMany({
      where: {
        workspaceId,
      },
      include: {
        project: true,
        reporter: true,
        members: {
          include: {
            user: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        _count: {
          select: {
            comments: true,
            subtasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, workspaceId: string, taskId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
      include: {
        project: true,
        reporter: true,
        parentTask: true,
        subtasks: true,
        members: {
          include: {
            user: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        resources: true,
        activities: {
          include: {
            actor: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    userId: string,
    workspaceId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);

    const existingTask = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!existingTask) {
      throw new NotFoundException('Task not found');
    }

    if (dto.projectId) {
      await this.assertProjectBelongsToWorkspace(workspaceId, dto.projectId);
    }

    if (dto.reporterId) {
      await this.assertUserBelongsToWorkspace(
        workspaceId,
        dto.reporterId,
        'Reporter',
      );
    }

    if (dto.parentTaskId) {
      if (dto.parentTaskId === taskId) {
        throw new BadRequestException('A task cannot be its own parent');
      }

      await this.assertParentTaskBelongsToWorkspace(
        workspaceId,
        dto.parentTaskId,
      );
    }

    return this.prisma.task.update({
      where: {
        id: existingTask.id,
      },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        startDate:
          dto.startDate !== undefined ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate !== undefined ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId,
        reporterId: dto.reporterId,
        parentTaskId: dto.parentTaskId,
      },
      include: {
        project: true,
        reporter: true,
      },
    });
  }

  async remove(userId: string, workspaceId: string, taskId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);

    const existingTask = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!existingTask) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({
      where: {
        id: existingTask.id,
      },
    });

    return {
      success: true,
    };
  }

  async addMember(
    userId: string,
    workspaceId: string,
    taskId: string,
    memberId: string,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.assertUserBelongsToWorkspace(
      workspaceId,
      memberId,
      'Task member',
    );

    return this.prisma.taskMember.create({
      data: {
        taskId,
        userId: memberId,
      },
      include: {
        user: true,
      },
    });
  }

  async removeMember(
    userId: string,
    workspaceId: string,
    taskId: string,
    memberId: string,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const membership = await this.prisma.taskMember.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: memberId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Task member not found');
    }

    await this.prisma.taskMember.delete({
      where: {
        taskId_userId: {
          taskId,
          userId: memberId,
        },
      },
    });

    return {
      success: true,
    };
  }
  async createSubtask(
    userId: string,
    workspaceId: string,
    parentTaskId: string,
    dto: CreateSubtaskDto,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);

    const parentTask = await this.prisma.task.findFirst({
      where: {
        id: parentTaskId,
        workspaceId,
      },
    });

    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    if (dto.projectId) {
      await this.assertProjectBelongsToWorkspace(workspaceId, dto.projectId);
    }

    if (dto.reporterId) {
      await this.assertUserBelongsToWorkspace(
        workspaceId,
        dto.reporterId,
        'Reporter',
      );
    }

    const subtask = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        workspaceId,
        projectId: dto.projectId,
        reporterId: dto.reporterId ?? userId,
        parentTaskId,
      },
      include: {
        reporter: true,
        project: true,
      },
    });

    await this.activityService.record(parentTaskId, userId, 'CREATED', {
      subtaskId: subtask.id,
      type: 'SUBTASK',
    });

    return subtask;
  }

  async findSubtasks(
    userId: string,
    workspaceId: string,
    parentTaskId: string,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);

    const parentTask = await this.prisma.task.findFirst({
      where: {
        id: parentTaskId,
        workspaceId,
      },
    });

    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    return this.prisma.task.findMany({
      where: {
        workspaceId,
        parentTaskId,
      },
      include: {
        reporter: true,
        project: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
