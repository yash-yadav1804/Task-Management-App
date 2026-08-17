import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthService } from '../auth/auth.service';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  getMyWorkspaces(
    @CurrentUser()
    user: Awaited<ReturnType<AuthService['getUserFromRefreshToken']>>,
  ) {
    return this.workspacesService.getUserWorkspaces(user.id);
  }

  @Get(':id')
  getWorkspace(
    @Param('id') workspaceId: string,
    @CurrentUser()
    user: Awaited<ReturnType<AuthService['getUserFromRefreshToken']>>,
  ) {
    return this.workspacesService.getWorkspaceById(user.id, workspaceId);
  }
}
