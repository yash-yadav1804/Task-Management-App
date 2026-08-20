import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateLabelDto } from './create-label.dto';
import { LabelsService } from './labels.service';

type CurrentUserType = Awaited<
  ReturnType<AuthService['getUserFromRefreshToken']>
>;

@Controller('workspaces/:workspaceId')
@UseGuards(AuthGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post('labels')
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateLabelDto,
  ) {
    return this.labelsService.create(user.id, workspaceId, dto.name);
  }

  @Get('labels')
  findAll(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.labelsService.findAll(user.id, workspaceId);
  }

  @Post('tasks/:taskId/labels/:labelId')
  addToTask(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.labelsService.addToTask(user.id, workspaceId, taskId, labelId);
  }

  @Delete('tasks/:taskId/labels/:labelId')
  removeFromTask(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.labelsService.removeFromTask(
      user.id,
      workspaceId,
      taskId,
      labelId,
    );
  }
}
