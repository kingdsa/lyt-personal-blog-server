import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, Min } from 'class-validator';

export class GetAccessLogsQuery {
  @Type(() => Number)
  @IsNumber({}, { message: 'page 必须是数字' })
  @Min(1, { message: 'page 必须大于 0' })
  page: number = 1;

  @Type(() => Number)
  @IsNumber({}, { message: 'limit 必须是数字' })
  @Min(1, { message: 'limit 必须大于 0' })
  limit: number = 10;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  path?: string;
}
