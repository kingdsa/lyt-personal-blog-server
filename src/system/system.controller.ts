import { Controller, Get, Post, Query, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { SystemService, CreateAccessLogDto } from './system.service';
import {
  ApiResponse,
  ResponseCode,
} from '../common/interfaces/api-response.interface';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('access-logs')
  async getAccessLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('ip') ip?: string,
    @Query('path') path?: string,
  ): Promise<ApiResponse> {
    const result = await this.systemService.getAccessLogs({
      page,
      limit,
      ip,
      path,
    });
    return {
      code: ResponseCode.SUCCESS,
      msg: '获取访问日志成功',
      data: result,
    };
  }

  @Get('access-logs/:id')
  async getAccessLogById(@Param('id') id: string): Promise<ApiResponse> {
    const result = await this.systemService.getAccessLogById(id);
    return {
      code: ResponseCode.SUCCESS,
      msg: '获取访问日志详情成功',
      data: result,
    };
  }

  @Get('stats')
  async getStats(): Promise<ApiResponse> {
    const result = await this.systemService.getStats();
    return {
      code: ResponseCode.SUCCESS,
      msg: '获取统计信息成功',
      data: result,
    };
  }

  private getClientIp(req: Request): string {
    // 优先从代理头中获取真实IP
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];

    if (forwarded) {
      // x-forwarded-for 可能包含多个IP，取第一个
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return ips.split(',')[0].trim();
    }

    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // 如果是IPv6的localhost，转换为IPv4
    if (req.ip === '::1') {
      return '127.0.0.1';
    }

    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  @Post('access-logs')
  async createAccessLog(
    @Req() req: Request,
    @Body() body?: Partial<CreateAccessLogDto>,
  ): Promise<ApiResponse> {
    // 使用优化的IP获取方法
    const createAccessLogDto: CreateAccessLogDto = {
      ip: this.getClientIp(req),
      method: req.method,
      path: req.path,
      params: req.query ? JSON.stringify(req.query) : undefined,
      userAgent: req.get('User-Agent') || undefined,
      referer: req.get('Referer') || req.get('Referrer') || undefined,
      statusCode: 200, // 默认为200，实际应该在response interceptor中设置
      deviceType: this.getDeviceType(req.get('User-Agent')),
      os: this.getOS(req.get('User-Agent')),
      browser: this.getBrowser(req.get('User-Agent')),
      // 如果有body参数，可以从中获取额外信息
      ...(body || {}),
    };

    const result = await this.systemService.createAccessLog(createAccessLogDto);
    return {
      code: ResponseCode.SUCCESS,
      msg: '创建访问日志成功',
      data: result,
    };
  }

  private getDeviceType(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;

    const ua = userAgent.toLowerCase();
    if (
      ua.includes('mobile') ||
      ua.includes('android') ||
      ua.includes('iphone')
    ) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private getOS(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;

    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';

    return undefined;
  }

  private getBrowser(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;

    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';

    return undefined;
  }

  @Get('test-ip')
  testIp(@Req() req: Request): ApiResponse {
    const ipInfo = {
      'req.ip': req.ip,
      'req.connection.remoteAddress': req.connection.remoteAddress,
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      clientIp: this.getClientIp(req),
    };

    return {
      code: ResponseCode.SUCCESS,
      msg: 'IP 信息获取成功',
      data: ipInfo,
    };
  }
}
