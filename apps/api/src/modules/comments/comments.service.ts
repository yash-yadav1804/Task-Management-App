import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CommentsService {
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

  private async getTask(workspaceId: string, taskId: string) {
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
    body: string,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);
    await this.getTask(workspaceId, taskId);

    return this.prisma.comment.create({
      data: {
        taskId,
        authorId: userId,
        body: body.trim(),
      },
      include: {
        author: true,
      },
    });
  }

  async findAll(userId: string, workspaceId: string, taskId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);
    await this.getTask(workspaceId, taskId);

    return this.prisma.comment.findMany({
      where: {
        taskId,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async remove(
    userId: string,
    workspaceId: string,
    taskId: string,
    commentId: string,
  ) {
    await this.assertWorkspaceMember(userId, workspaceId);
    await this.getTask(workspaceId, taskId);

    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: {
        id: comment.id,
      },
    });

    return {
      success: true,
    };
  }
}
