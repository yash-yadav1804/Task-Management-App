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
import { CreateCommentDto } from './create-comment.dto';
import { CommentsService } from './comments.service';

type CurrentUserType = Awaited<
  ReturnType<AuthService['getUserFromRefreshToken']>
>;

@Controller('workspaces/:workspaceId/tasks/:taskId/comments')
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.id, workspaceId, taskId, dto.body);
  }

  @Get()
  findAll(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.commentsService.findAll(user.id, workspaceId, taskId);
  }

  @Delete(':commentId')
  remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.commentsService.remove(user.id, workspaceId, taskId, commentId);
  }
}
