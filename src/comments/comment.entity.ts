import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';

/**
 * Comment Entity
 * 
 * Represents a comment on a blog post
 * 
 * Relationships:
 * - N:1 with User (Many comments can be written by one user)
 * - N:1 with Post (Many comments belong to one post)
 */
@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: true })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Many-to-One relationship with User
   * Many comments can be written by one author
   */
  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  /**
   * Many-to-One relationship with Post
   * Many comments belong to one post
   * onDelete: CASCADE - If post is deleted, its comments are also deleted
   */
  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  postId: string;
}
