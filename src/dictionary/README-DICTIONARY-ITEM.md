# 字典子项模块 (Dictionary Item Module)

## 功能概述

字典子项模块为字典系统提供了子级数据管理功能。每个字典可以包含多个子项，每个子项都有唯一的枚举值和名称。

## 数据表结构

### `dictionary_items` 表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | varchar(36) | 主键, UUID | 唯一标识符 |
| dictionaryId | varchar(36) | 外键, 非空 | 父级字典ID |
| name | varchar(100) | 非空 | 子项名称 |
| value | int | 非空 | 枚举值（从0开始，同一字典下唯一） |
| description | varchar(255) | 可选 | 描述信息 |
| isEnable | boolean | 默认true | 是否启用 |
| sort | int | 默认0 | 排序值 |
| createdAt | timestamp | 自动 | 创建时间 |
| updatedAt | timestamp | 自动 | 更新时间 |
| deletedAt | timestamp | 可选 | 软删除时间 |

### 数据约束

- `(dictionaryId, name)` 联合唯一索引 - 同一字典下名称不能重复
- `(dictionaryId, value)` 联合唯一索引 - 同一字典下枚举值不能重复
- 支持软删除

## API 接口

### 基础路由
所有接口都以 `/dictionary-item` 为前缀。

### 1. 创建字典子项
**POST** `/dictionary-item/create`

**请求参数：**
```json
{
  "dictionaryId": "字典ID",
  "name": "子项名称",
  "value": 0,
  "description": "描述信息（可选）",
  "isEnable": true,
  "sort": 0
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "创建字典子项成功",
  "data": {
    "id": "uuid",
    "dictionaryId": "字典ID",
    "name": "子项名称",
    "value": 0,
    "description": "描述信息",
    "isEnable": true,
    "sort": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 查询字典子项列表（分页）
**GET** `/dictionary-item/list`

**查询参数：**
- `dictionaryId`: 字典ID（可选）
- `keyword`: 关键字搜索（可选）
- `isEnable`: 是否启用（可选）
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认10）

### 3. 根据字典ID查询子项列表
**GET** `/dictionary-item/dictionary/:dictionaryId`

返回指定字典下所有启用的子项，按排序和枚举值排序。

### 4. 获取下一个可用的枚举值
**GET** `/dictionary-item/next-value/:dictionaryId`

返回指定字典下下一个可用的枚举值（当前最大值+1）。

### 5. 根据ID查询详情
**GET** `/dictionary-item/:id`

### 6. 更新字典子项
**PATCH** `/dictionary-item/:id`

### 7. 删除字典子项
**DELETE** `/dictionary-item/:id`

### 8. 批量删除字典子项
**DELETE** `/dictionary-item/batch/remove`

**请求参数：**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

## 业务规则

### 1. 枚举值管理
- 枚举值从0开始递增
- 同一字典下的枚举值必须唯一
- 提供 `getNextValue` 接口获取下一个可用值

### 2. 名称管理
- 同一字典下的名称必须唯一
- 支持模糊搜索

### 3. 数据验证
- 所有字段都有完整的数据验证
- 支持可选字段的默认值设置

### 4. 关联约束
- 创建/更新时会验证父级字典是否存在
- 支持级联查询父级字典信息

## 使用示例

### 1. 创建性别字典的子项
```bash
# 假设已有性别字典，ID为 "gender-dict-id"

# 创建男性选项
POST /dictionary-item/create
{
  "dictionaryId": "gender-dict-id",
  "name": "男",
  "value": 0,
  "description": "男性"
}

# 创建女性选项
POST /dictionary-item/create
{
  "dictionaryId": "gender-dict-id",
  "name": "女",
  "value": 1,
  "description": "女性"
}
```

### 2. 查询指定字典的所有子项
```bash
GET /dictionary-item/dictionary/gender-dict-id
```

### 3. 获取下一个可用的枚举值
```bash
GET /dictionary-item/next-value/gender-dict-id
# 返回: { "nextValue": 2 }
```

## 模块依赖

- `@nestjs/common` - NestJS核心模块
- `@nestjs/typeorm` - TypeORM集成
- `class-validator` - 数据验证
- `class-transformer` - 数据转换
- 依赖 `Dictionary` 实体进行关联查询

## 注意事项

1. **数据一致性**: 删除字典时应考虑是否删除相关的子项
2. **枚举值设计**: 建议使用连续的数字作为枚举值，便于排序和管理
3. **性能优化**: 查询大量数据时建议使用分页接口
4. **软删除**: 系统支持软删除，删除的数据仍保留在数据库中 