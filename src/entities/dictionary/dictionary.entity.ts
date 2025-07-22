import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('dictionaries')
@Index(['type'])
@Index(['type', 'name'], { unique: true })
export class Dictionary extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    comment: '字典类型',
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '字典名称',
  })
  name: string;

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

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '父级ID',
  })
  parentId?: string;
}
