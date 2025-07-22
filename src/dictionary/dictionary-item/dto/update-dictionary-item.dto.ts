import { IsOptional } from 'class-validator';
import { CreateDictionaryItemDto } from './create-dictionary-item.dto';

export class UpdateDictionaryItemDto {
  @IsOptional()
  dictionaryId?: CreateDictionaryItemDto['dictionaryId'];

  @IsOptional()
  name?: CreateDictionaryItemDto['name'];

  @IsOptional()
  value?: CreateDictionaryItemDto['value'];

  @IsOptional()
  description?: CreateDictionaryItemDto['description'];

  @IsOptional()
  isEnable?: CreateDictionaryItemDto['isEnable'];

  @IsOptional()
  sort?: CreateDictionaryItemDto['sort'];
}
