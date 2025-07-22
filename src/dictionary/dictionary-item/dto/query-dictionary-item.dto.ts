import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryDictionaryItemDto {
  @IsOptional()
  @IsString({ message: 'dictionaryId必须是字符串' })
  dictionaryId?: string;

  @IsOptional()
  @IsString({ message: 'keyword必须是字符串' })
  keyword?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value as boolean;
  })
  @IsBoolean({ message: 'isEnable必须是布尔值' })
  isEnable?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'page必须是数字' })
  @Min(1, { message: 'page必须大于0' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'pageSize必须是数字' })
  @Min(1, { message: 'pageSize必须大于0' })
  pageSize?: number = 10;
}
