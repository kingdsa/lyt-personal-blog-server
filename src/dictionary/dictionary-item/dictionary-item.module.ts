import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryItemService } from './dictionary-item.service';
import { DictionaryItemController } from './dictionary-item.controller';
import { DictionaryItem, Dictionary } from '@/entities/dictionary';

@Module({
  imports: [TypeOrmModule.forFeature([DictionaryItem, Dictionary])],
  controllers: [DictionaryItemController],
  providers: [DictionaryItemService],
  exports: [DictionaryItemService],
})
export class DictionaryItemModule {}
