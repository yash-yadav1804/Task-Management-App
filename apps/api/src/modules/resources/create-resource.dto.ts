import { IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @IsUrl()
  @MaxLength(2048)
  url!: string;
}
