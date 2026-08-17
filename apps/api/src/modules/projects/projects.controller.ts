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
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

type CurrentUserType = Awaited<
  ReturnType<AuthService['getUserFromRefreshToken']>
>;

@Controller('workspaces/:workspaceId/projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.id, workspaceId, dto);
  }

  @Get()
  findAll(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.projectsService.findAll(user.id, workspaceId);
  }

  @Get(':projectId')
  findOne(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.projectsService.findOne(user.id, workspaceId, projectId);
  }

  @Patch(':projectId')
  update(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(user.id, workspaceId, projectId, dto);
  }

  @Delete(':projectId')
  remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.projectsService.remove(user.id, workspaceId, projectId);
  }
}
