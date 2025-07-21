import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { createHash } from 'crypto';
import { User } from '../entities/user/user.entity';
import { RegisterDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * MD5 加密
   */
  private hashPassword(password: string): string {
    return createHash('md5').update(password).digest('hex');
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
