import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Dictionary } from '../entities/dictionary/dictionary.entity';
import {
  CreateDictionaryDto,
  UpdateDictionaryDto,
  QueryDictionaryDto,
} from './dto';

@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(Dictionary)
    private readonly dictionaryRepository: Repository<Dictionary>,
  ) {}

  /**
   * 创建字典
   */
  async create(createDictionaryDto: CreateDictionaryDto): Promise<{
    message: string;
    dictionary: Dictionary;
  }> {
    const { type, name } = createDictionaryDto;

    // 检查类型或名称是否已存在（只要有一个存在就不允许添加）
    const existing = await this.dictionaryRepository
      .createQueryBuilder('dict')
      .where('dict.type = :type OR dict.name = :name', { type, name })
      .getOne();

    if (existing) {
      const message =
        existing.type === type ? '该字典类型已存在' : '该字典名称已存在';
      throw new ConflictException(message);
    }

    try {
      const dictionary = this.dictionaryRepository.create({
        ...createDictionaryDto,
        isEnable: createDictionaryDto.isEnable ?? true,
        sort: createDictionaryDto.sort ?? 0,
      });

      const savedDictionary = await this.dictionaryRepository.save(dictionary);

      return {
        message: '创建字典成功',
        dictionary: savedDictionary,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('Duplicate entry')) {
          throw new ConflictException('该类型下的字典名称已存在');
        }
      }
      throw new InternalServerErrorException('创建字典失败，请稍后重试');
    }
  }

  /**
   * 查询字典列表（分页）
   */
  async findMany(queryDto: QueryDictionaryDto): Promise<{
    message: string;
    data: Dictionary[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { type, keyword, isEnable, page = 1, pageSize = 10 } = queryDto;

    const queryBuilder = this.dictionaryRepository.createQueryBuilder('dict');

    // 添加查询条件
    if (type) {
      queryBuilder.andWhere('dict.type = :type', { type });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(dict.name LIKE :keyword OR dict.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (typeof isEnable === 'boolean') {
      queryBuilder.andWhere('dict.isEnable = :isEnable', { isEnable });
    }

    // 排序
    queryBuilder.orderBy('dict.sort', 'ASC');
    queryBuilder.addOrderBy('dict.createdAt', 'DESC');

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      message: '查询字典列表成功',
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 根据ID查询字典
   */
  async findOne(id: string): Promise<{
    message: string;
    dictionary: Dictionary;
  }> {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { id },
    });

    if (!dictionary) {
      throw new NotFoundException('字典不存在');
    }

    return {
      message: '查询字典成功',
      dictionary,
    };
  }

  /**
   * 根据类型查询字典列表
   */
  async findByType(type: string): Promise<{
    message: string;
    data: Dictionary[];
  }> {
    const data = await this.dictionaryRepository.find({
      where: { type, isEnable: true },
      order: { sort: 'ASC', createdAt: 'DESC' },
    });

    return {
      message: '查询字典列表成功',
      data,
    };
  }

  /**
   * 更新字典
   */
  async update(
    id: string,
    updateDictionaryDto: UpdateDictionaryDto,
  ): Promise<{
    message: string;
    dictionary: Dictionary;
  }> {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { id },
    });

    if (!dictionary) {
      throw new NotFoundException('字典不存在');
    }

    // 如果修改了类型或名称，需要检查是否重复
    if (updateDictionaryDto.type || updateDictionaryDto.name) {
      const type = updateDictionaryDto.type || dictionary.type;
      const name = updateDictionaryDto.name || dictionary.name;

      // 检查类型或名称是否已存在
      const existing = await this.dictionaryRepository
        .createQueryBuilder('dict')
        .where('(dict.type = :type OR dict.name = :name) AND dict.id != :id', {
          type,
          name,
          id,
        })
        .getOne();

      if (existing) {
        const message =
          existing.type === type ? '该字典类型已存在' : '该字典名称已存在';
        throw new ConflictException(message);
      }
    }

    try {
      await this.dictionaryRepository.update(id, updateDictionaryDto);

      const updatedDictionary = await this.dictionaryRepository.findOne({
        where: { id },
      });

      return {
        message: '更新字典成功',
        dictionary: updatedDictionary!,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('Duplicate entry')) {
          throw new ConflictException('该类型下的字典名称已存在');
        }
      }
      throw new InternalServerErrorException('更新字典失败，请稍后重试');
    }
  }

  /**
   * 删除字典
   */
  async remove(id: string): Promise<{ message: string }> {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { id },
    });

    if (!dictionary) {
      throw new NotFoundException('字典不存在');
    }

    try {
      await this.dictionaryRepository.softDelete(id);
      return { message: '删除字典成功' };
    } catch {
      throw new InternalServerErrorException('删除字典失败，请稍后重试');
    }
  }

  /**
   * 批量删除字典
   */
  async removeMany(ids: string[]): Promise<{ message: string }> {
    if (!ids || ids.length === 0) {
      throw new ConflictException('请选择要删除的字典');
    }

    try {
      await this.dictionaryRepository.softDelete(ids);
      return { message: `成功删除 ${ids.length} 个字典` };
    } catch {
      throw new InternalServerErrorException('批量删除字典失败，请稍后重试');
    }
  }
}
