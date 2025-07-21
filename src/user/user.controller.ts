import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto';
import { ResponseUtil } from '../common/utils';
import { ApiResponse } from '../common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 用户注册
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponse<{ userId: string }>> {
    const result = await this.userService.register(registerDto);

    return ResponseUtil.success({ userId: result.userId }, result.message);
  }
}
