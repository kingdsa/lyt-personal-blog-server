import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    comment: '用户名',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '邮箱',
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '密码',
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '昵称',
  })
  nickname?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '头像',
    default:
      'https://lyt-oss-web.oss-cn-beijing.aliyuncs.com/default-avatar.png',
  })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'user'],
    default: 'user',
    comment: '用户角色',
  })
  role: 'admin' | 'user';

  @Column({
    type: 'boolean',
    default: true,
    comment: '是否激活',
  })
  isActive: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '最后登录时间',
  })
  lastLoginAt?: Date;
}
