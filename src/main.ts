import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { Express } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 信任代理服务器，获取真实IP
  (app.getHttpAdapter().getInstance() as Express).set('trust proxy', true);

  // 启用跨域支持
  app.enableCors({
    origin: process.env.CORS_ORIGIN || true, // 使用环境变量配置允许的来源
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Version'], // 添加 version 头部
    credentials: true, // 允许携带凭证
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
