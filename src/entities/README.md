# 实体模块化架构

## 概述
为了提高代码的可维护性和可扩展性，我们将 entities 目录进行了模块化重构。每个功能模块都有自己的目录和导出文件。

## 目录结构

```
src/entities/
├── common/             # 通用实体
│   ├── base.entity.ts  # 基础实体类
│   └── index.ts        # 通用模块导出
├── user/               # 用户相关实体
│   ├── user.entity.ts  # 用户实体
│   └── index.ts        # 用户模块导出
├── system/             # 系统相关实体
│   ├── access-log.entity.ts  # 访问日志实体
│   └── index.ts        # 系统模块导出
└── index.ts            # 主导出文件
```

## 模块说明

### common 模块
- **base.entity.ts**: 提供所有实体的基础字段和功能
  - id: UUID 主键
  - createdAt: 创建时间
  - updatedAt: 更新时间
  - deletedAt: 软删除时间

### user 模块
- **user.entity.ts**: 用户实体，包含用户认证和个人信息
  - 用户名、邮箱、密码等基本信息
  - 角色权限管理
  - 用户状态管理

### system 模块
- **access-log.entity.ts**: 访问日志实体，记录系统访问信息
  - 访问IP、地理位置信息
  - 请求信息（方法、路径、参数）
  - 设备和浏览器信息
  - 用户关联信息

## 使用方式

### 导入单个实体
```typescript
import { User } from '../entities/user';
import { AccessLog } from '../entities/system';
import { BaseEntity } from '../entities/common';
```

### 导入所有实体
```typescript
import { User, AccessLog, BaseEntity } from '../entities';
```

## 添加新实体

1. 确定实体属于哪个功能模块
2. 在对应模块目录下创建实体文件
3. 在模块的 index.ts 中导出新实体
4. 如果是新模块，需要在主 index.ts 中导出该模块

## 优势

- **模块化**: 按功能分组，便于管理和维护
- **可扩展**: 新增模块时不影响现有结构
- **清晰**: 目录结构清晰，易于理解和导航
- **复用**: 通用实体可以被多个模块使用 