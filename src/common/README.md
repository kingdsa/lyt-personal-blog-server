# 统一API响应格式封装

本模块提供了企业级标准的API响应格式封装，确保所有API接口返回统一的数据结构。

## 目录结构

```
src/common/
├── interfaces/
│   └── api-response.interface.ts    # 响应接口定义
├── utils/
│   └── response.util.ts             # 响应工具类
├── interceptors/
│   └── response.interceptor.ts      # 响应拦截器
├── filters/
│   └── http-exception.filter.ts     # 异常过滤器
├── common.module.ts                 # 通用模块
├── index.ts                         # 导出文件
└── README.md                        # 使用说明
```

## 响应格式

### 标准响应格式

```typescript
{
  code: number;        // 响应状态码
  data: any;          // 响应数据
  msg: string;        // 响应消息
  timestamp: number;  // 时间戳
  requestId: string;  // 请求ID（用于链路追踪）
}
```

### 成功响应示例

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com"
  },
  "msg": "获取用户信息成功",
  "timestamp": 1703123456789,
  "requestId": "1703123456789-abc123def"
}
```

### 错误响应示例

```json
{
  "code": 400,
  "data": null,
  "msg": "请求参数错误",
  "timestamp": 1703123456789,
  "requestId": "1703123456789-abc123def",
  "error": {
    "details": "用户名不能为空"
  }
}
```

### 分页响应示例

```json
{
  "code": 200,
  "data": {
    "list": [
      {"id": 1, "name": "用户1"},
      {"id": 2, "name": "用户2"}
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  },
  "msg": "查询成功",
  "timestamp": 1703123456789,
  "requestId": "1703123456789-abc123def"
}
```

## 使用方法

### 1. 自动格式化（推荐）

由于已经配置了全局响应拦截器，控制器方法可以直接返回数据，会自动包装成标准格式：

```typescript
@Controller('users')
export class UserController {
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return user; // 自动包装成标准格式
  }
}
```

### 2. 手动格式化

使用 `ResponseUtil` 工具类手动创建响应：

```typescript
import { ResponseUtil } from './common';

@Controller('users')
export class UserController {
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return ResponseUtil.success(user, '获取用户信息成功');
  }

  @Post()
  async createUser(@Body() userData: CreateUserDto) {
    const user = await this.userService.create(userData);
    return ResponseUtil.created(user, '用户创建成功');
  }
}
```

### 3. 错误处理

抛出异常会被全局异常过滤器自动处理：

```typescript
@Get(':id')
async getUserById(@Param('id') id: string) {
  const user = await this.userService.findById(id);
  if (!user) {
    throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
  }
  return user;
}
```

或者使用 `ResponseUtil` 的错误方法：

```typescript
@Get(':id')
async getUserById(@Param('id') id: string) {
  const user = await this.userService.findById(id);
  if (!user) {
    return ResponseUtil.notFound('用户不存在');
  }
  return ResponseUtil.success(user);
}
```

### 4. 分页数据

```typescript
@Get()
async getUsers(@Query() query: GetUsersDto) {
  const { list, total } = await this.userService.findMany(query);
  return ResponseUtil.pagination(
    list,
    total,
    query.page,
    query.pageSize,
    '获取用户列表成功'
  );
}
```

## ResponseUtil 工具类方法

- `success<T>(data: T, msg?: string, code?, requestId?)` - 创建成功响应
- `created<T>(data: T, msg?, requestId?)` - 创建创建成功响应
- `error(msg, code?, error?, requestId?)` - 创建错误响应
- `pagination<T>(list, total, page, pageSize, msg?, requestId?)` - 创建分页响应
- `badRequest(msg?, details?, requestId?)` - 创建参数错误响应
- `unauthorized(msg?, requestId?)` - 创建未授权响应
- `forbidden(msg?, requestId?)` - 创建禁止访问响应
- `notFound(msg?, requestId?)` - 创建资源未找到响应
- `internalServerError(msg?, error?, requestId?)` - 创建服务器错误响应
- `serviceUnavailable(msg?, requestId?)` - 创建服务不可用响应

## 状态码定义

```typescript
export enum ResponseCode {
  SUCCESS = 200,                    // 成功
  CREATED = 201,                    // 创建成功
  BAD_REQUEST = 400,                // 请求参数错误
  UNAUTHORIZED = 401,               // 未授权
  FORBIDDEN = 403,                  // 禁止访问
  NOT_FOUND = 404,                  // 资源未找到
  INTERNAL_SERVER_ERROR = 500,      // 服务器内部错误
  SERVICE_UNAVAILABLE = 503,        // 服务不可用
}
```

## 注意事项

1. 该模块已配置为全局模块，会自动应用到所有控制器
2. 响应拦截器会自动为所有响应添加标准格式
3. 异常过滤器会自动处理所有未捕获的异常
4. 建议在开发环境下启用错误堆栈信息，生产环境下关闭
5. 请求ID可用于链路追踪和日志关联
