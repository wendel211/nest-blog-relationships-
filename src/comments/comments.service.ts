import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';

/**
 * CommentsService
 * 
 * Business logic for comment management
 * Demonstrates validation across multiple related entities
 */
@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  /**
   * Create a new comment
   * 
   * Business Rules:
   * - Author must exist and be active
   * - Post must exist and be published
   * - Comments require approval by default
   */
  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    // Verify author exists and is active
    const author = await this.usersService.findOne(createCommentDto.authorId);
    if (!author.isActive) {
      throw new BadRequestException('Author account is not active');
    }

    // Verify post exists and is published
    const post = await this.postsService.findOne(createCommentDto.postId);
    if (!post.published) {
      throw new BadRequestException('Cannot comment on unpublished posts');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      author,
      post,
      isApproved: false, // Comments need approval
    });

    return this.commentsRepository.save(comment);
  }

  /**
   * Find all comments
   */
  async findAll(): Promise<Comment[]> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.post', 'post')
      .orderBy('comment.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Find approved comments only
   * Business Rule: Only show approved comments publicly
   */
  async findApproved(): Promise<Comment[]> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.post', 'post')
      .where('comment.isApproved = :isApproved', { isApproved: true })
      .andWhere('author.isActive = :isActive', { isActive: true })
      .orderBy('comment.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Find comments by post
   */
  async findByPost(postId: string): Promise<Comment[]> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.isApproved = :isApproved', { isApproved: true })
      .orderBy('comment.createdAt', 'ASC')
      .getMany();
  }

  /**
   * Find a single comment
   */
  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.post', 'post')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  /**
   * Update a comment
   * Business Rule: Only content and approval status can be updated
   */
  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    Object.assign(comment, updateCommentDto);
    return this.commentsRepository.save(comment);
  }

  /**
   * Approve a comment
   */
  async approve(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.isApproved = true;
    return this.commentsRepository.save(comment);
  }

  /**
   * Delete a comment
   */
  async remove(id: string): Promise<void> {
    const comment = await this.findOne(id);
    await this.commentsRepository.remove(comment);
  }
}
