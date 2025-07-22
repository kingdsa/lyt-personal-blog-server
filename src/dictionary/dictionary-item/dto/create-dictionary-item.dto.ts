import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Length,
  Min,
} from 'class-validator';

export class CreateDictionaryItemDto {
  @IsString({ message: 'dictionaryId必须是字符串' })
  @Length(1, 36, { message: 'dictionaryId长度必须在1-36个字符之间' })
  dictionaryId: string;

  @IsString({ message: 'name必须是字符串' })
  @Length(1, 100, { message: 'name长度必须在1-100个字符之间' })
  name: string;

  @IsNumber({}, { message: 'value必须是数字' })
  @Min(0, { message: 'value必须大于等于0' })
  value: number;

  @IsOptional()
  @IsString({ message: 'description必须是字符串' })
  @Length(0, 255, { message: 'description长度不能超过255个字符' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isEnable必须是布尔值' })
  isEnable?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'sort必须是数字' })
  sort?: number;
}
