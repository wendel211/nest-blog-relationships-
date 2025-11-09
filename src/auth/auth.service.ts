import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

/**
 * AuthService
 * 
 * Handles authentication business logic:
 * - User registration with password hashing
 * - User login with credential validation
 * - JWT token generation
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   * 
   * Business Rules:
   * - Email must be unique
   * - Password is hashed using bcrypt before storage
   * - Returns user data with JWT token
   */
  async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string }> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // Create user
    const user = this.usersRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      bio: registerDto.bio,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    // Generate JWT token
    const accessToken = this.generateToken(user);

    // Remove password from response
    delete user.password;

    return { user, accessToken };
  }

  /**
   * Login user
   * 
   * Business Rules:
   * - User must exist and be active
   * - Password must match stored hash
   * - Returns user data with JWT token
   */
  async login(loginDto: LoginDto): Promise<{ user: User; accessToken: string }> {
    // Find user with password field (normally excluded by select: false)
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: loginDto.email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const accessToken = this.generateToken(user);

    // Remove password from response
    delete user.password;

    return { user, accessToken };
  }

  /**
   * Validate user by ID
   * 
   * Used by JWT strategy to validate token payload
   */
  async validateUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  /**
   * Generate JWT token for user
   * 
   * @param user - User object
   * @returns JWT access token
   */
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
}
