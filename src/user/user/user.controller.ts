import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseUtil } from '../../common/utils';
import { ApiResponse, ResponseCode } from '../../common';

@Controller('user/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 根据ID获取用户信息
   */
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<ApiResponse<any>> {
    const user = await this.userService.findById(id);

    if (!user) {
      return ResponseUtil.error('用户不存在', ResponseCode.NOT_FOUND);
    }

    // 移除敏感信息
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userInfo } = user;

    return ResponseUtil.success(userInfo, '获取用户信息成功');
  }
}
