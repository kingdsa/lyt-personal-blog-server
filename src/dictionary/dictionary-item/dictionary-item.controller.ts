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
import { DictionaryItemService } from './dictionary-item.service';
import {
  CreateDictionaryItemDto,
  UpdateDictionaryItemDto,
  QueryDictionaryItemDto,
} from './dto/index';
import { ResponseUtil } from '@/common/utils';
import { ApiResponse } from '@/common';

@Controller('dictionary-item')
export class DictionaryItemController {
  constructor(private readonly dictionaryItemService: DictionaryItemService) {}

  /**
   * 创建字典子项
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDictionaryItemDto: CreateDictionaryItemDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.dictionaryItemService.create(
      createDictionaryItemDto,
    );
    return ResponseUtil.success(result.dictionaryItem, result.message);
  }

  /**
   * 查询字典子项列表（分页）
   */
  @Get('list')
  @HttpCode(HttpStatus.OK)
  async findMany(
    @Query() queryDto: QueryDictionaryItemDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.dictionaryItemService.findMany(queryDto);
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
   * 根据字典ID查询子项列表
   */
  @Get('dictionary/:dictionaryId')
  @HttpCode(HttpStatus.OK)
  async findByDictionaryId(
    @Param('dictionaryId') dictionaryId: string,
  ): Promise<ApiResponse<any>> {
    const result =
      await this.dictionaryItemService.findByDictionaryId(dictionaryId);
    return ResponseUtil.success(result.data, result.message);
  }

  /**
   * 获取下一个可用的枚举值
   */
  @Get('next-value/:dictionaryId')
  @HttpCode(HttpStatus.OK)
  async getNextValue(
    @Param('dictionaryId') dictionaryId: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.dictionaryItemService.getNextValue(dictionaryId);
    return ResponseUtil.success(
      { nextValue: result.nextValue },
      result.message,
    );
  }

  /**
   * 根据ID查询字典子项详情
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<ApiResponse<any>> {
    const result = await this.dictionaryItemService.findOne(id);
    return ResponseUtil.success(result.dictionaryItem, result.message);
  }

  /**
   * 更新字典子项
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDictionaryItemDto: UpdateDictionaryItemDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.dictionaryItemService.update(
      id,
      updateDictionaryItemDto,
    );
    return ResponseUtil.success(result.dictionaryItem, result.message);
  }

  /**
   * 删除字典子项
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    const result = await this.dictionaryItemService.remove(id);
    return ResponseUtil.success(null, result.message);
  }

  /**
   * 批量删除字典子项
   */
  @Delete('batch/remove')
  @HttpCode(HttpStatus.OK)
  async removeMany(
    @Body() body: { ids: string[] },
  ): Promise<ApiResponse<null>> {
    const result = await this.dictionaryItemService.removeMany(body.ids);
    return ResponseUtil.success(null, result.message);
  }
}
