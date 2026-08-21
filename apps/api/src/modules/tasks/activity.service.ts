import { Injectable } from '@nestjs/common';
import { ActivityType, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    taskId: string,
    actorId: string,
    type: ActivityType,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.prisma.activity.create({
      data: {
        taskId,
        actorId,
        type,
        metadata,
      },
    });
  }

  async findByTask(taskId: string) {
    return this.prisma.activity.findMany({
      where: {
        taskId,
      },
      include: {
        actor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
