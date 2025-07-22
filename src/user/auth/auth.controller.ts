import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { ResponseUtil } from '../../common/utils';
import { ApiResponse } from '../../common';

@Controller('user/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponse<{ userId: string }>> {
    const result = await this.authService.register(registerDto);

    return ResponseUtil.success({ userId: result.userId }, result.message);
  }

  /**
   * 用户登录
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<
    ApiResponse<{
      user: {
        id: string;
        username: string;
        email: string;
        nickname: string;
        avatar?: string;
        role: 'admin' | 'user';
      };
      token: string;
    }>
  > {
    const result = await this.authService.login(loginDto);

    return ResponseUtil.success(
      {
        user: result.user,
        token: result.token,
      },
      result.message,
    );
  }
}
