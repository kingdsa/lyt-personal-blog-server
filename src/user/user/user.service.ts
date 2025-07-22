import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
    });
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: string, updateData: Partial<User>): Promise<void> {
    await this.userRepository.update(id, updateData);
  }
}
