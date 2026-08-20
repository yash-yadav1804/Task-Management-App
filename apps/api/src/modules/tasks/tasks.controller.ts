import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AddTaskMemberDto } from './dto/add-task-member.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

type CurrentUserType = Awaited<
  ReturnType<AuthService['getUserFromRefreshToken']>
>;

@Controller('workspaces/:workspaceId/tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(user.id, workspaceId, dto);
  }

  @Get()
  findAll(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.tasksService.findAll(user.id, workspaceId);
  }

  @Get(':taskId')
  findOne(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.tasksService.findOne(user.id, workspaceId, taskId);
  }

  @Patch(':taskId')
  update(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.id, workspaceId, taskId, dto);
  }

  @Delete(':taskId')
  remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.tasksService.remove(user.id, workspaceId, taskId);
  }
  @Post(':taskId/members')
  addMember(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: CurrentUserType,
    @Body() dto: AddTaskMemberDto,
  ) {
    return this.tasksService.addMember(
      user.id,
      workspaceId,
      taskId,
      dto.userId,
    );
  }

  @Delete(':taskId/members/:userId')
  removeMember(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('userId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.tasksService.removeMember(
      user.id,
      workspaceId,
      taskId,
      memberId,
    );
  }
}
