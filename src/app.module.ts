import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'blog_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Only for development! Use migrations in production
      logging: true, // Enable query logging for learning purposes
    }),
    UsersModule,
    PostsModule,
    CommentsModule,
    CategoriesModule,
    AuthModule,
  ],
})
export class AppModule {}
