import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/user.entity';

/**
 * AuthController
 * 
 * Handles authentication endpoints:
 * - POST /auth/register - Register new user
 * - POST /auth/login - Login user
 * - GET /auth/profile - Get current user profile (protected)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * 
   * @param registerDto - User registration data
   * @returns User object and JWT access token
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * 
   * @param loginDto - User login credentials
   * @returns User object and JWT access token
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Get current user profile
   * 
   * Protected endpoint - requires valid JWT token
   * 
   * @param user - Current authenticated user (injected by decorator)
   * @returns User profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return { user };
  }
}
