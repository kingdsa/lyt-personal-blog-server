import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  Length,
} from 'class-validator';

export class UpdateDictionaryDto {
  @IsOptional()
  @IsString({ message: '字典类型必须是字符串' })
  @Length(1, 50, { message: '字典类型长度应在1-50个字符之间' })
  type?: string;

  @IsOptional()
  @IsString({ message: '字典名称必须是字符串' })
  @Length(1, 100, { message: '字典名称长度应在1-100个字符之间' })
  name?: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @Length(0, 255, { message: '描述长度不能超过255个字符' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: '启用状态必须是布尔值' })
  isEnable?: boolean;

  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  sort?: number;

  @IsOptional()
  @IsString({ message: '父级ID必须是字符串' })
  @Length(0, 50, { message: '父级ID长度不能超过50个字符' })
  parentId?: string;

  @IsOptional()
  id?: string;
}
