# JWT Token 生成和验证功能说明

本项目已经集成了JWT token的生成和验证功能，使用了NestJS的JWT模块和自定义的JWT服务。

## 配置

JWT配置已在`.env.development`文件中设置：

```bash
JWT_SECRET=jwt_secret_key
JWT_EXPIRES_IN=7d
```

## API接口

### 1. 生成Token

**接口**: `POST /system/generate-token`

**请求体**:
```json
{
  "sub": "user123",
  "username": "张三", 
  "email": "zhangsan@example.com",
  "roles": ["user", "admin"]
}
```

**响应**:
```json
{
  "code": 200,
  "msg": "Token生成成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### 2. 验证Token

**接口**: `POST /system/verify-token`

**请求体**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**:
```json
{
  "code": 200,
  "msg": "Token验证成功",
  "data": {
    "sub": "user123",
    "username": "张三",
    "email": "zhangsan@example.com", 
    "roles": ["user", "admin"],
    "iat": 1703123456,
    "exp": 1703728256
  }
}
```

### 3. 解码Token（不验证签名）

**接口**: `POST /system/decode-token`

**请求体**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**:
```json
{
  "code": 200,
  "msg": "Token解码成功", 
  "data": {
    "sub": "user123",
    "username": "张三",
    "email": "zhangsan@example.com",
    "roles": ["user", "admin"],
    "iat": 1703123456,
    "exp": 1703728256
  }
}
```

## 代码使用示例

### 在其他服务中注入JWT服务

```typescript
import { Injectable } from '@nestjs/common';
import { CustomJwtService, JwtPayload } from '../common';

@Injectable()
export class UserService {
  constructor(private readonly jwtService: CustomJwtService) {}

  async loginUser(userId: string, username: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      username,
    };
    
    const tokenResult = await this.jwtService.generateToken(payload);
    return tokenResult.accessToken;
  }
}
```

### 创建JWT认证守卫

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { CustomJwtService } from '../common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: CustomJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      return false;
    }

    try {
      const payload = await this.jwtService.verifyToken(token);
      request['user'] = payload;
      return true;
    } catch {
      return false;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## JWT Payload 接口

```typescript
interface JwtPayload {
  sub: string;        // 用户ID (必须)
  username?: string;  // 用户名
  email?: string;     // 邮箱
  roles?: string[];   // 角色列表
  [key: string]: unknown; // 其他自定义字段
}
```

## 安全建议

1. **JWT_SECRET**: 在生产环境中使用强密码，建议使用随机生成的长字符串
2. **过期时间**: 根据业务需求设置合适的过期时间，建议访问令牌较短（如1小时），刷新令牌较长（如30天）
3. **HTTPS**: 生产环境必须使用HTTPS传输JWT token
4. **存储**: 客户端应将token存储在安全的地方，避免XSS攻击

## 环境变量配置

确保在对应的环境文件中设置JWT配置：

```bash
# .env.development
JWT_SECRET=your_development_secret_key
JWT_EXPIRES_IN=7d

# .env.production  
JWT_SECRET=your_very_secure_production_secret_key
JWT_EXPIRES_IN=1h
``` 