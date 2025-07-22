import { IsOptional, IsString, IsBoolean, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryDictionaryDto {
  @IsOptional()
  @IsString({ message: '字典类型必须是字符串' })
  @Length(1, 50, { message: '字典类型长度应在1-50个字符之间' })
  type?: string;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  @Length(1, 100, { message: '关键词长度应在1-100个字符之间' })
  keyword?: string;

  @IsOptional()
  @Transform(({ value }) => {
    return !!value;
  })
  @IsBoolean({ message: '启用状态必须是布尔值' })
  isEnable?: boolean;

  // @IsOptional()
  // @IsString({ message: '父级ID必须是字符串' })
  // parentId?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  pageSize: number = 10;
}
