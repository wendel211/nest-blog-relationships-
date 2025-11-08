import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsInt()
  @IsOptional()
  @Min(0)
  viewCount?: number;
}
