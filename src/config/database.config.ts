import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  return {
    type: 'mysql',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 3306),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
    synchronize: !isProduction, // 生产环境不自动同步
    logging: !isProduction, // 生产环境不输出日志
    dropSchema: false,
    migrationsRun: false,
    migrations: [path.join(__dirname, '..', 'migrations', '*{.ts,.js}')],
    timezone: '+08:00', // 设置时区为北京时间
    charset: 'utf8mb4',
    extra: {
      connectionLimit: isProduction ? 10 : 5,
      acquireTimeout: 60000,
      timeout: 60000,
    },
  };
};
