import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../posts/post.entity';
import { Comment } from '../comments/comment.entity';

/**
 * User Entity
 * 
 * Represents a user in the blog system.
 * 
 * Relationships:
 * - 1:N with Posts (One user can have many posts)
 * - 1:N with Comments (One user can have many comments)
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 50 })
  name: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * One-to-Many relationship with Posts
   * cascade: true - When we save/update a user, related posts are also saved/updated
   * eager: false - Posts are not loaded automatically (we'll use joins when needed)
   */
  @OneToMany(() => Post, (post) => post.author, { cascade: true })
  posts: Post[];

  /**
   * One-to-Many relationship with Comments
   */
  @OneToMany(() => Comment, (comment) => comment.author, { cascade: true })
  comments: Comment[];
}
