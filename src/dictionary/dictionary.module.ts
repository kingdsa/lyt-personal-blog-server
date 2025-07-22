import { Module } from '@nestjs/common';
import { DictionaryModule as DictionarySubModule } from './dictionary/dictionary.module';
import { DictionaryItemModule } from './dictionary-item/dictionary-item.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [DictionarySubModule, DictionaryItemModule, CommonModule],
  exports: [DictionarySubModule, DictionaryItemModule],
})
export class DictionaryModule {}
