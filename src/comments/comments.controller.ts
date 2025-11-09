import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.commentsService.findAll(paginationDto);
  }

  @Get('approved')
  findApproved(@Query() paginationDto: PaginationDto) {
    return this.commentsService.findApproved(paginationDto);
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: string, @Query() paginationDto: PaginationDto) {
    return this.commentsService.findByPost(postId, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Put(':id/approve')
  approve(@Param('id') id: string) {
    return this.commentsService.approve(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
