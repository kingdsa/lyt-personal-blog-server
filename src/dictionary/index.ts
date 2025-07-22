// 导出主模块
export * from './dictionary.module';

// 导出字典子模块 (excluding DictionaryModule to avoid naming conflict)
export { DictionaryController, DictionaryService } from './dictionary/index';
export * from './dictionary/dto';

// 导出字典项子模块
export * from './dictionary-item';
