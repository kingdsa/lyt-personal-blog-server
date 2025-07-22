import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import {
  CreateDictionaryDto,
  UpdateDictionaryDto,
  QueryDictionaryDto,
} from './dto/index';
import { ResponseUtil } from '@/common/utils';
import { ApiResponse } from '@/common';

@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  /**
   * 创建字典
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDictionaryDto: CreateDictionaryDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.dictionaryService.create(createDictionaryDto);
    return ResponseUtil.success(result.dictionary, result.message);
  }

  /**
   * 查询字典列表（分页）
   */
  @Get('list')
  @HttpCode(HttpStatus.OK)
  async findMany(
    @Query() queryDto: QueryDictionaryDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.dictionaryService.findMany(queryDto);
    return ResponseUtil.success(
      {
        list: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
      result.message,
    );
  }

  /**
   * 根据类型查询字典列表
   */
  @Get('type/:type')
  @HttpCode(HttpStatus.OK)
  async findByType(@Param('type') type: string): Promise<ApiResponse<any>> {
    const result = await this.dictionaryService.findByType(type);
    return ResponseUtil.success(result.data, result.message);
  }

  /**
   * 根据ID查询字典详情
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<ApiResponse<any>> {
    const result = await this.dictionaryService.findOne(id);
    return ResponseUtil.success(result.dictionary, result.message);
  }

  /**
   * 更新字典
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDictionaryDto: UpdateDictionaryDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.dictionaryService.update(id, updateDictionaryDto);
    return ResponseUtil.success(result.dictionary, result.message);
  }

  /**
   * 删除字典
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    const result = await this.dictionaryService.remove(id);
    return ResponseUtil.success(null, result.message);
  }

  /**
   * 批量删除字典
   */
  @Delete('batch/remove')
  @HttpCode(HttpStatus.OK)
  async removeMany(
    @Body() body: { ids: string[] },
  ): Promise<ApiResponse<null>> {
    const result = await this.dictionaryService.removeMany(body.ids);
    return ResponseUtil.success(null, result.message);
  }
}
