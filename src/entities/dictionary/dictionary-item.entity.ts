import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Dictionary } from './dictionary.entity';

@Entity('dictionary_items')
@Index(['dictionaryId'])
@Index(['dictionaryId', 'value'], { unique: true })
@Index(['dictionaryId', 'name'], { unique: true })
export class DictionaryItem extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 36,
    comment: '字典ID',
  })
  dictionaryId: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '子项名称',
  })
  name: string;

  @Column({
    type: 'int',
    comment: '枚举值（从0开始，同一字典下不能重复）',
  })
  value: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '描述',
  })
  description?: string;

  @Column({
    type: 'boolean',
    default: true,
    comment: '是否启用',
  })
  isEnable: boolean;

  @Column({
    type: 'int',
    default: 0,
    comment: '排序',
  })
  sort: number;

  // 关联父级字典
  @ManyToOne(() => Dictionary, { nullable: false })
  @JoinColumn({ name: 'dictionaryId' })
  dictionary: Dictionary;
}
