import { Controller, Get, Post, Query, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { AccessLogService } from './access-log.service';
import { CreateAccessLogDto, GetAccessLogsQuery } from './dto';
import {
  ApiResponse,
  ResponseCode,
} from '@/common/interfaces/api-response.interface';

@Controller('system/access-logs')
export class AccessLogController {
  constructor(private readonly accessLogService: AccessLogService) {}

  @Get('stats')
  async getStats(): Promise<ApiResponse> {
    const result = await this.accessLogService.getStats();
    return {
      code: ResponseCode.SUCCESS,
      msg: '获取统计信息成功',
      data: result,
    };
  }

  @Get()
  async getAccessLogs(
    @Query() query: GetAccessLogsQuery,
  ): Promise<ApiResponse> {
    const result = await this.accessLogService.getAccessLogs(query);
    return {
      code: ResponseCode.SUCCESS,
      msg: '获取访问日志成功',
      data: result,
    };
  }

  @Get(':id')
  async getAccessLogById(@Param('id') id: string): Promise<ApiResponse> {
    const result = await this.accessLogService.getAccessLogById(id);
    return {
      code: ResponseCode.SUCCESS,
      msg: '获取访问日志详情成功',
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

  @Post()
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

    const result =
      await this.accessLogService.createAccessLog(createAccessLogDto);
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
}
