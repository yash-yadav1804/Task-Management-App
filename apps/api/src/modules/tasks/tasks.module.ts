import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ActivityService } from './activity.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [AuthModule],
  controllers: [TasksController],
  providers: [TasksService, ActivityService],
  exports: [ActivityService],
})
export class TasksModule {}
