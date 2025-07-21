import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomJwtService } from '../common/services/jwt.service';
// import '../types/express';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: CustomJwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 添加调试日志
    console.log(
      `🔍 TokenMiddleware执行 - Path: ${req.path}, Method: ${req.method}`,
    );

    // 白名单路径 - 不需要token验证的接口
    const whiteList = ['/system/generate-token', '/'];

    // 检查当前请求路径是否在白名单中
    const currentPath = req.path;
    const isWhiteListed = whiteList.some(
      (path) => currentPath === path || currentPath.includes(path),
    );

    console.log(
      `📝 白名单检查 - Current Path: ${currentPath}, Is WhiteListed: ${isWhiteListed}`,
    );

    if (isWhiteListed) {
      console.log(`✅ 路径在白名单中，跳过token验证`);
      return next();
    }

    try {
      // 从header中获取authorization
      const authHeader = req.headers.authorization;
      console.log(`🔑 Authorization Header: ${authHeader ? '存在' : '不存在'}`);

      if (!authHeader) {
        console.log(`❌ 缺少Authorization header`);
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Authorization header is required',
            error: 'Unauthorized',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 支持Bearer token格式
      let token: string;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // 如果没有Bearer前缀，直接使用header的值作为token
        token = authHeader;
      }

      if (!token) {
        console.log(`❌ Token为空`);
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Token is required',
            error: 'Unauthorized',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 验证token
      const payload = await this.jwtService.verifyToken(token);
      console.log(`✅ Token验证成功:`, payload);
      next();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Token验证失败:`, errorMessage);
      // 处理JWT相关错误
      if (error instanceof HttpException) {
        throw error;
      }

      // JWT验证失败的统一错误处理
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid or expired token',
          error: 'Unauthorized',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
