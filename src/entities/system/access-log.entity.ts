import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { User } from '../user/user.entity';

@Entity('access_logs')
@Index(['ip'])
@Index(['createdAt'])
@Index(['userId'])
export class AccessLog extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 45,
    comment: 'IP地址',
  })
  ip: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '地区信息',
  })
  region?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '国家',
  })
  country?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '省份',
  })
  province?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '城市',
  })
  city?: string;

  @Column({
    type: 'varchar',
    length: 10,
    comment: '请求方法',
  })
  method: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '请求路径',
  })
  path: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '请求参数',
  })
  params?: string;

  @Column({
    type: 'varchar',
    length: 1000,
    nullable: true,
    comment: '用户代理',
  })
  userAgent?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '来源页面',
  })
  referer?: string;

  @Column({
    type: 'int',
    comment: '响应状态码',
  })
  statusCode: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: '响应时间(毫秒)',
  })
  responseTime?: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '设备类型',
  })
  deviceType?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '操作系统',
  })
  os?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '浏览器',
  })
  browser?: string;

  @Column({
    type: 'uuid',
    nullable: true,
    comment: '用户ID',
  })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
