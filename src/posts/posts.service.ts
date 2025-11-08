import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';

/**
 * PostsService
 * 
 * Business logic for post management
 * Demonstrates handling of complex relationships and business rules
 */
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Create a new post with categories
   * 
   * Business Rules:
   * - Author must exist and be active
   * - Slug must be unique
   * - Published posts must have publishedAt date
   */
  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Verify author exists and is active
    const author = await this.usersService.findOne(createPostDto.authorId);
    if (!author.isActive) {
      throw new BadRequestException('Author account is not active');
    }

    // Check if slug already exists
    const existingPost = await this.postsRepository.findOne({
      where: { slug: createPostDto.slug },
    });

    if (existingPost) {
      throw new ConflictException('Post slug already exists');
    }

    // Get categories if provided
    let categories = [];
    if (createPostDto.categoryIds && createPostDto.categoryIds.length > 0) {
      categories = await this.categoriesService.findByIds(createPostDto.categoryIds);
      
      if (categories.length !== createPostDto.categoryIds.length) {
        throw new BadRequestException('One or more category IDs are invalid');
      }
    }

    // Create post with categories
    const post = this.postsRepository.create({
      ...createPostDto,
      author,
      categories,
      publishedAt: createPostDto.published ? new Date() : null,
    });

    return this.postsRepository.save(post);
  }

  /**
   * Find all posts with joins
   * Demonstrates using query builder for complex queries with multiple joins
   */
  async findAll(): Promise<Post[]> {
    return this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'category')
      .leftJoinAndSelect('post.comments', 'comment')
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Find published posts only
   * Business Rule: Only show published posts to public
   */
  async findPublished(): Promise<Post[]> {
    return this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'category')
      .where('post.published = :published', { published: true })
      .andWhere('author.isActive = :isActive', { isActive: true })
      .orderBy('post.publishedAt', 'DESC')
      .getMany();
  }

  /**
   * Find a single post with all relationships
   */
  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'category')
      .leftJoinAndSelect('post.comments', 'comment')
      .leftJoinAndSelect('comment.author', 'commentAuthor')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  /**
   * Update a post
   * Business Rule: Cannot unpublish a post, only update publishedAt
   */
  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);

    // Check slug conflict
    if (updatePostDto.slug && updatePostDto.slug !== post.slug) {
      const existingPost = await this.postsRepository.findOne({
        where: { slug: updatePostDto.slug },
      });

      if (existingPost) {
        throw new ConflictException('Post slug already exists');
      }
    }

    // Update categories if provided
    if (updatePostDto.categoryIds) {
      const categories = await this.categoriesService.findByIds(updatePostDto.categoryIds);
      
      if (categories.length !== updatePostDto.categoryIds.length) {
        throw new BadRequestException('One or more category IDs are invalid');
      }
      
      post.categories = categories;
    }

    // Update publishedAt if publishing for the first time
    if (updatePostDto.published && !post.published) {
      post.publishedAt = new Date();
    }

    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  /**
   * Increment view count
   * Business Rule: Track post views
   */
  async incrementViewCount(id: string): Promise<Post> {
    const post = await this.findOne(id);
    post.viewCount += 1;
    return this.postsRepository.save(post);
  }

  /**
   * Delete a post
   * Cascade delete will automatically remove associated comments
   */
  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.postsRepository.remove(post);
  }
}
