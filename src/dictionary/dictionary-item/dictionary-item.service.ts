import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { DictionaryItem } from '../../entities/dictionary/dictionary-item.entity';
import { Dictionary } from '../../entities/dictionary/dictionary.entity';
import {
  CreateDictionaryItemDto,
  UpdateDictionaryItemDto,
  QueryDictionaryItemDto,
} from './dto/index';

@Injectable()
export class DictionaryItemService {
  constructor(
    @InjectRepository(DictionaryItem)
    private readonly dictionaryItemRepository: Repository<DictionaryItem>,
    @InjectRepository(Dictionary)
    private readonly dictionaryRepository: Repository<Dictionary>,
  ) {}

  /**
   * 创建字典子项
   */
  async create(createDictionaryItemDto: CreateDictionaryItemDto): Promise<{
    message: string;
    dictionaryItem: DictionaryItem;
  }> {
    const { dictionaryId, name, value } = createDictionaryItemDto;

    // 检查父级字典是否存在
    const dictionary = await this.dictionaryRepository.findOne({
      where: { id: dictionaryId },
    });

    if (!dictionary) {
      throw new NotFoundException('父级字典不存在');
    }

    // 检查在同一字典下name是否已存在
    const existingByName = await this.dictionaryItemRepository.findOne({
      where: { dictionaryId, name },
    });

    if (existingByName) {
      throw new ConflictException('该字典下名称已存在');
    }

    // 检查在同一字典下value是否已存在
    const existingByValue = await this.dictionaryItemRepository.findOne({
      where: { dictionaryId, value },
    });

    if (existingByValue) {
      throw new ConflictException('该字典下枚举值已存在');
    }

    try {
      const dictionaryItem = this.dictionaryItemRepository.create({
        ...createDictionaryItemDto,
        isEnable: createDictionaryItemDto.isEnable ?? true,
        sort: createDictionaryItemDto.sort ?? 0,
      });

      const savedDictionaryItem =
        await this.dictionaryItemRepository.save(dictionaryItem);

      return {
        message: '创建字典子项成功',
        dictionaryItem: savedDictionaryItem,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('Duplicate entry')) {
          throw new ConflictException('该字典下的名称或枚举值已存在');
        }
      }
      throw new InternalServerErrorException('创建字典子项失败，请稍后重试');
    }
  }

  /**
   * 查询字典子项列表（分页）
   */
  async findMany(queryDto: QueryDictionaryItemDto): Promise<{
    message: string;
    data: DictionaryItem[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const {
      dictionaryId,
      keyword,
      isEnable,
      page = 1,
      pageSize = 10,
    } = queryDto;

    const queryBuilder =
      this.dictionaryItemRepository.createQueryBuilder('item');

    // 关联父级字典
    queryBuilder.leftJoinAndSelect('item.dictionary', 'dictionary');

    // 添加查询条件
    if (dictionaryId) {
      queryBuilder.andWhere('item.dictionaryId = :dictionaryId', {
        dictionaryId,
      });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(item.name LIKE :keyword OR item.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (typeof isEnable === 'boolean') {
      queryBuilder.andWhere('item.isEnable = :isEnable', { isEnable });
    }

    // 排序
    queryBuilder.orderBy('item.sort', 'ASC');
    queryBuilder.addOrderBy('item.value', 'ASC');
    queryBuilder.addOrderBy('item.createdAt', 'DESC');

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      message: '查询字典子项列表成功',
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 根据ID查询字典子项
   */
  async findOne(id: string): Promise<{
    message: string;
    dictionaryItem: DictionaryItem;
  }> {
    const dictionaryItem = await this.dictionaryItemRepository.findOne({
      where: { id },
      relations: ['dictionary'],
    });

    if (!dictionaryItem) {
      throw new NotFoundException('字典子项不存在');
    }

    return {
      message: '查询字典子项成功',
      dictionaryItem,
    };
  }

  /**
   * 根据字典ID查询子项列表
   */
  async findByDictionaryId(dictionaryId: string): Promise<{
    message: string;
    data: DictionaryItem[];
  }> {
    const data = await this.dictionaryItemRepository.find({
      where: { dictionaryId, isEnable: true },
      order: { sort: 'ASC', value: 'ASC', createdAt: 'DESC' },
    });

    return {
      message: '查询字典子项列表成功',
      data,
    };
  }

  /**
   * 更新字典子项
   */
  async update(
    id: string,
    updateDictionaryItemDto: UpdateDictionaryItemDto,
  ): Promise<{
    message: string;
    dictionaryItem: DictionaryItem;
  }> {
    const dictionaryItem = await this.dictionaryItemRepository.findOne({
      where: { id },
    });

    if (!dictionaryItem) {
      throw new NotFoundException('字典子项不存在');
    }

    // 如果修改了dictionaryId，需要检查父级字典是否存在
    if (updateDictionaryItemDto.dictionaryId) {
      const dictionary = await this.dictionaryRepository.findOne({
        where: { id: updateDictionaryItemDto.dictionaryId },
      });

      if (!dictionary) {
        throw new NotFoundException('父级字典不存在');
      }
    }

    // 确定最终的dictionaryId
    const finalDictionaryId =
      updateDictionaryItemDto.dictionaryId || dictionaryItem.dictionaryId;

    // 如果修改了name，需要检查是否重复
    if (updateDictionaryItemDto.name) {
      const existingByName = await this.dictionaryItemRepository.findOne({
        where: {
          dictionaryId: finalDictionaryId,
          name: updateDictionaryItemDto.name,
        },
      });

      if (existingByName && existingByName.id !== id) {
        throw new ConflictException('该字典下名称已存在');
      }
    }

    // 如果修改了value，需要检查是否重复
    if (updateDictionaryItemDto.value !== undefined) {
      const existingByValue = await this.dictionaryItemRepository.findOne({
        where: {
          dictionaryId: finalDictionaryId,
          value: updateDictionaryItemDto.value,
        },
      });

      if (existingByValue && existingByValue.id !== id) {
        throw new ConflictException('该字典下枚举值已存在');
      }
    }

    try {
      await this.dictionaryItemRepository.update(id, updateDictionaryItemDto);

      const updatedDictionaryItem = await this.dictionaryItemRepository.findOne(
        {
          where: { id },
          relations: ['dictionary'],
        },
      );

      return {
        message: '更新字典子项成功',
        dictionaryItem: updatedDictionaryItem!,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('Duplicate entry')) {
          throw new ConflictException('该字典下的名称或枚举值已存在');
        }
      }
      throw new InternalServerErrorException('更新字典子项失败，请稍后重试');
    }
  }

  /**
   * 删除字典子项
   */
  async remove(id: string): Promise<{ message: string }> {
    const dictionaryItem = await this.dictionaryItemRepository.findOne({
      where: { id },
    });

    if (!dictionaryItem) {
      throw new NotFoundException('字典子项不存在');
    }

    try {
      await this.dictionaryItemRepository.softDelete(id);
      return { message: '删除字典子项成功' };
    } catch {
      throw new InternalServerErrorException('删除字典子项失败，请稍后重试');
    }
  }

  /**
   * 批量删除字典子项
   */
  async removeMany(ids: string[]): Promise<{ message: string }> {
    if (!ids || ids.length === 0) {
      throw new ConflictException('请选择要删除的字典子项');
    }

    try {
      await this.dictionaryItemRepository.softDelete(ids);
      return { message: `成功删除 ${ids.length} 个字典子项` };
    } catch {
      throw new InternalServerErrorException(
        '批量删除字典子项失败，请稍后重试',
      );
    }
  }

  /**
   * 获取下一个可用的枚举值
   */
  async getNextValue(dictionaryId: string): Promise<{
    message: string;
    nextValue: number;
  }> {
    const maxValueItem = await this.dictionaryItemRepository
      .createQueryBuilder('item')
      .where('item.dictionaryId = :dictionaryId', { dictionaryId })
      .orderBy('item.value', 'DESC')
      .getOne();

    const nextValue = maxValueItem ? maxValueItem.value + 1 : 0;

    return {
      message: '获取下一个可用枚举值成功',
      nextValue,
    };
  }
}
