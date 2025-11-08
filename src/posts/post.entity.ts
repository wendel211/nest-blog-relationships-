import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';
import { Category } from '../categories/category.entity';

/**
 * Post Entity
 * 
 * Represents a blog post
 * 
 * Relationships:
 * - N:1 with User (Many posts belong to one user/author)
 * - 1:N with Comments (One post can have many comments)
 * - N:N with Categories (Many posts can have many categories)
 */
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ unique: true, length: 250 })
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  /**
   * Many-to-One relationship with User
   * Many posts can belong to one author
   * 
   * @JoinColumn creates a foreign key column 'authorId' in the posts table
   * onDelete: 'CASCADE' - If user is deleted, their posts are also deleted
   */
  @ManyToOne(() => User, (user) => user.posts, { 
    onDelete: 'CASCADE',
    eager: false, // Don't load author automatically
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  /**
   * One-to-Many relationship with Comments
   * One post can have many comments
   * 
   * cascade: true - When we save/remove a post, comments are also saved/removed
   */
  @OneToMany(() => Comment, (comment) => comment.post, { 
    cascade: true,
    eager: false,
  })
  comments: Comment[];

  /**
   * Many-to-Many relationship with Categories
   * A post can have many categories, and a category can be assigned to many posts
   * 
   * @JoinTable creates a junction table 'post_categories'
   * This decorator should only be on one side of the relationship
   */
  @ManyToMany(() => Category, (category) => category.posts, {
    cascade: true,
    eager: false,
  })
  @JoinTable({
    name: 'post_categories',
    joinColumn: { name: 'postId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];
}
