import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { createHash } from 'crypto';
import { User } from '@/entities/user/user.entity';
import { RegisterDto, LoginDto } from './dto';
import { CustomJwtService } from '@/common/services/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: CustomJwtService,
  ) {}

  /**
   * MD5 加密
   */
  private hashPassword(password: string): string {
    return createHash('md5').update(password).digest('hex');
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<{
    message: string;
    user: {
      id: string;
      username: string;
      email: string;
      nickname: string;
      avatar?: string;
      role: 'admin' | 'user';
      createdAt: Date;
    };
    token: string;
  }> {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查用户是否激活
    if (!user.isActive) {
      throw new UnauthorizedException('账户已被禁用');
    }

    // 验证密码
    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 更新最后登录时间
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // 生成 JWT token
    const tokenPayload = {
      sub: user.id,
      username: user.username,
      roles: [user.role],
    };

    const tokenResult = await this.jwtService.generateToken(tokenPayload);

    // 返回用户信息和 token
    return {
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname || '',
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
      token: tokenResult.accessToken,
    };
  }

  /**
   * 用户注册
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; userId: string }> {
    const { username, password, email, nickname } = registerDto;

    // 检查用户名是否已存在
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUserByUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('邮箱已被注册');
    }

    try {
      // 创建新用户
      const user = this.userRepository.create({
        username,
        password: this.hashPassword(password),
        email,
        nickname,
        role: 'user',
        isActive: true,
      });

      const savedUser = await this.userRepository.save(user);

      return {
        message: '注册成功',
        userId: savedUser.id,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // 处理数据库约束错误
        if (error.message.includes('Duplicate entry')) {
          if (error.message.includes('email')) {
            throw new ConflictException('邮箱已被注册');
          }
          if (error.message.includes('username')) {
            throw new ConflictException('用户名已存在');
          }
        }
      }

      throw new InternalServerErrorException('注册失败，请稍后重试');
    }
  }
}
