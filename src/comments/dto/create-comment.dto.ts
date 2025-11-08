import { IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Comment content cannot be empty' })
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  content: string;

  @IsUUID('4', { message: 'Post ID must be a valid UUID' })
  @IsNotEmpty()
  postId: string;

  @IsUUID('4', { message: 'Author ID must be a valid UUID' })
  @IsNotEmpty()
  authorId: string;
}
