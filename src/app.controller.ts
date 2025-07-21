import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseUtil, ApiResponse, SuccessResponse } from './common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('success-example')
  getSuccessExample(): SuccessResponse<{ message: string; timestamp: number }> {
    // 手动使用ResponseUtil创建标准响应
    return ResponseUtil.success(
      {
        message: 'This is a success example',
        timestamp: Date.now(),
      },
      '获取成功示例数据成功',
    );
  }

  @Get('error-example')
  getErrorExample(): never {
    // 抛出异常，将被异常过滤器处理并返回标准错误格式
    throw new HttpException('这是一个错误示例', HttpStatus.BAD_REQUEST);
  }

  @Get('pagination-example')
  getPaginationExample(): ApiResponse<any> {
    // 分页数据示例
    const mockData = [
      { id: 1, name: '用户1', email: 'user1@example.com' },
      { id: 2, name: '用户2', email: 'user2@example.com' },
      { id: 3, name: '用户3', email: 'user3@example.com' },
    ];

    return ResponseUtil.pagination(
      mockData,
      100, // 总数
      '获取用户列表成功',
    );
  }

  @Post('create-example')
  createExample(
    @Body() data: Record<string, unknown>,
  ): SuccessResponse<Record<string, unknown>> {
    // 创建成功示例
    const createdData: Record<string, unknown> = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    return ResponseUtil.created(createdData, '创建成功');
  }

  @Get('user/:id')
  getUserById(@Param('id') id: string): SuccessResponse<any> {
    if (id === '999') {
      // 演示404错误
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    const userData = {
      id: parseInt(id),
      name: `用户${id}`,
      email: `user${id}@example.com`,
    };

    return ResponseUtil.success(userData, '获取用户信息成功');
  }
}
