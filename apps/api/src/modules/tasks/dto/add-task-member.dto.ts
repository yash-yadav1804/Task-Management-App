import { IsUUID } from 'class-validator';

export class AddTaskMemberDto {
  @IsUUID()
  userId!: string;
}
