import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Post } from '../posts/post.entity';

/**
 * Category Entity
 * 
 * Represents a category/tag for blog posts
 * 
 * Relationships:
 * - N:N with Posts (Many categories can be assigned to many posts)
 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ unique: true, length: 50 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Many-to-Many relationship with Posts
   * A category can be assigned to many posts
   */
  @ManyToMany(() => Post, (post) => post.categories)
  posts: Post[];
}
