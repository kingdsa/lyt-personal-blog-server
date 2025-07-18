import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { Express } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 信任代理服务器，获取真实IP
  (app.getHttpAdapter().getInstance() as Express).set('trust proxy', true);

  // 启用跨域支持
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // 允许的来源列表
      const allowedOrigins: (string | RegExp)[] = [
        'https://lyt-personal-blog.pages.dev',
        /^https:\/\/.*\.lyt-personal-blog\.pages\.dev$/,
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
      ];

      // 如果没有origin（比如移动端或Postman），允许通过
      if (!origin) return callback(null, true);

      // 检查origin是否在允许列表中
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === 'string') {
          return origin === allowedOrigin;
        }
        return allowedOrigin.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: true, // 允许所有头部
    credentials: true, // 允许携带凭证
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
