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
import { CreateResourceDto } from './create-resource.dto';
import { ResourcesService } from './resources.service';

type CurrentUserType = Awaited<
  ReturnType<AuthService['getUserFromRefreshToken']>
>;

@Controller('workspaces/:workspaceId/tasks/:taskId/resources')
@UseGuards(AuthGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateResourceDto,
  ) {
    return this.resourcesService.create(user.id, workspaceId, taskId, dto);
  }

  @Get()
  findAll(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.resourcesService.findAll(user.id, workspaceId, taskId);
  }

  @Delete(':resourceId')
  remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.resourcesService.remove(
      user.id,
      workspaceId,
      taskId,
      resourceId,
    );
  }
}
