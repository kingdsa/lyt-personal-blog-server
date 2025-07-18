import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { AccessLog } from '../entities/access-log.entity';

export interface CreateAccessLogDto {
  ip: string;
  region?: string;
  country?: string;
  province?: string;
  city?: string;
  method: string;
  path: string;
  params?: string;
  userAgent?: string;
  referer?: string;
  statusCode: number;
  responseTime?: number;
  deviceType?: string;
  os?: string;
  browser?: string;
  userId?: string;
}

export interface GetAccessLogsQuery {
  page: number;
  limit: number;
  ip?: string;
  path?: string;
}

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(AccessLog)
    private accessLogRepository: Repository<AccessLog>,
  ) {}

  async getAccessLogs(query: GetAccessLogsQuery) {
    const { page, limit, ip, path } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.accessLogRepository.createQueryBuilder('accessLog');

    if (ip) {
      queryBuilder.andWhere('accessLog.ip LIKE :ip', { ip: `%${ip}%` });
    }

    if (path) {
      queryBuilder.andWhere('accessLog.path LIKE :path', { path: `%${path}%` });
    }

    queryBuilder.orderBy('accessLog.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAccessLogById(id: string) {
    return await this.accessLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async getStats() {
    const total = await this.accessLogRepository.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.accessLogRepository.count({
      where: {
        createdAt: MoreThanOrEqual(today),
      },
    });

    const uniqueIpsResult = (await this.accessLogRepository
      .createQueryBuilder('accessLog')
      .select('COUNT(DISTINCT accessLog.ip)', 'count')
      .getRawOne()) as { count: string } | null;

    const uniqueVisitors = parseInt(uniqueIpsResult?.count || '0');

    return {
      totalLogs: total,
      todayLogs: todayCount,
      uniqueVisitors,
    };
  }

  async createAccessLog(createAccessLogDto: CreateAccessLogDto) {
    const accessLog = this.accessLogRepository.create(createAccessLogDto);
    return await this.accessLogRepository.save(accessLog);
  }
}
