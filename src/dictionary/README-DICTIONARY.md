# 字典管理系统使用说明

## 功能概述

字典管理系统提供了一个灵活的数据字典解决方案，支持通过 `type` 字段来区分不同类型的字典数据，非常适合管理各种分类数据，如文章分类、状态码、配置选项等。

## 字典实体结构

```typescript
{
  id: string;          // UUID 主键
  type: string;        // 字典类型（用于区分不同的字典）
  name: string;        // 字典名称
  value?: string;      // 字典值（可选）
  description?: string; // 描述信息（可选）
  isEnable: boolean;   // 是否启用（默认 true）
  sort: number;        // 排序字段（默认 0）
  parentId?: string;   // 父级ID（支持层级结构，可选）
  createdAt: Date;     // 创建时间
  updatedAt: Date;     // 更新时间
  deletedAt?: Date;    // 软删除时间
}
```

## API 接口

### 1. 创建字典
```http
POST /dictionary
Content-Type: application/json

{
  "type": "article_category",
  "name": "技术分享",
  "value": "tech",
  "description": "技术相关的文章分类",
  "isEnable": true,
  "sort": 1
}
```

### 2. 查询字典列表（支持分页和筛选）
```http
GET /dictionary?type=article_category&page=1&pageSize=10&isEnable=true
```

查询参数：
- `type`: 字典类型（可选）
- `name`: 字典名称模糊搜索（可选）
- `isEnable`: 启用状态（可选）
- `parentId`: 父级ID（可选）
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 10）

### 3. 根据类型查询字典列表
```http
GET /dictionary/type/article_category
```

### 4. 查询字典详情
```http
GET /dictionary/:id
```

### 5. 更新字典
```http
PATCH /dictionary/:id
Content-Type: application/json

{
  "name": "更新后的名称",
  "isEnable": false
}
```

### 6. 删除字典
```http
DELETE /dictionary/:id
```

### 7. 批量删除字典
```http
DELETE /dictionary/batch/remove
Content-Type: application/json

{
  "ids": ["id1", "id2", "id3"]
}
```

## 使用示例

### 文章分类管理

1. **创建文章分类字典**：
```bash
# 创建技术分享分类
curl -X POST http://localhost:3000/dictionary \
  -H "Content-Type: application/json" \
  -d '{
    "type": "article_category",
    "name": "技术分享",
    "value": "tech",
    "description": "技术相关的文章分类",
    "sort": 1
  }'
```

2. **获取所有文章分类**：
```bash
curl http://localhost:3000/dictionary/type/article_category
```

3. **在文章系统中使用**：
```typescript
// 在文章服务中获取分类列表
const categories = await this.dictionaryService.findByType('article_category');

// 在创建文章时验证分类是否存在
const category = await this.dictionaryService.findOne(categoryId);
if (!category || !category.isEnable) {
  throw new NotFoundException('文章分类不存在或已禁用');
}
```

## 数据结构特点

### 1. 类型隔离
通过 `type` 字段实现不同字典类型的数据隔离，同一个系统可以管理多种类型的字典数据。

### 2. 层级支持
通过 `parentId` 字段支持层级结构，可以构建树形分类体系。

### 3. 软删除
使用 TypeORM 的软删除功能，删除的数据不会物理删除，便于数据恢复。

### 4. 排序支持
通过 `sort` 字段支持自定义排序，查询时会按照 `sort` 升序和 `createdAt` 降序排列。

### 5. 启用状态控制
通过 `isEnable` 字段控制字典项的启用状态，便于动态控制显示。

## 预设字典类型

系统预设了以下字典类型：

- `article_category`: 文章分类
  - 技术分享
  - 生活随笔
  - 学习笔记
  - 项目经验
  - 工具推荐

你可以根据业务需要添加更多字典类型，如：
- `article_status`: 文章状态（草稿、已发布、已下线）
- `user_status`: 用户状态（正常、冻结、注销）
- `comment_status`: 评论状态（待审核、已通过、已拒绝）

## 最佳实践

1. **命名规范**：建议使用下划线分隔的小写字母作为 `type` 值，如 `article_category`。
2. **唯一性约束**：同一类型下的名称必须唯一。
3. **软删除**：建议使用软删除而不是物理删除，保护数据完整性。
4. **缓存优化**：对于频繁查询的字典数据，建议在应用层添加缓存。
5. **权限控制**：根据业务需要，可以添加权限控制中间件。 