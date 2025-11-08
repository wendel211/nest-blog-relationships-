import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  MaxLength,
  MinLength,
  Matches,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new post
 * 
 * This is a nested DTO that includes category IDs
 * Demonstrates how to handle N:N relationships in creation
 */
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(250)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase with hyphens only (e.g., my-blog-post)',
  })
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsUUID('4', { message: 'Author ID must be a valid UUID' })
  @IsNotEmpty()
  authorId: string;

  /**
   * Array of category IDs to associate with this post
   * Demonstrates nested relationship handling
   */
  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @IsUUID('4', { each: true, message: 'Each category ID must be a valid UUID' })
  @Type(() => String)
  categoryIds?: string[];
}
