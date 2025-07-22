import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { AccessLog } from '../../entities';
import { IpGeolocationUtil } from '../../common/utils/ip-geolocation.util';
import { CreateAccessLogDto, GetAccessLogsQuery } from './dto';

@Injectable()
export class AccessLogService {
  constructor(
    @InjectRepository(AccessLog)
    private accessLogRepository: Repository<AccessLog>,
  ) {}

  async getAccessLogs(query: GetAccessLogsQuery) {
    console.log('[AccessLog] getAccessLogs 查询参数:', query);

    const { page, limit, ip, path } = query;
    const skip = (page - 1) * limit;

    console.log('[AccessLog] 计算的分页参数:', { skip, limit });

    const queryBuilder =
      this.accessLogRepository.createQueryBuilder('accessLog');

    if (ip) {
      queryBuilder.andWhere('accessLog.ip LIKE :ip', { ip: `%${ip}%` });
    }

    if (path) {
      queryBuilder.andWhere('accessLog.path LIKE :path', { path: `%${path}%` });
    }

    queryBuilder.orderBy('accessLog.createdAt', 'DESC').skip(skip).take(limit);

    console.log('[AccessLog] 生成的 SQL 查询:', queryBuilder.getSql());
    console.log('[AccessLog] 查询参数:', queryBuilder.getParameters());

    const [data, total] = await queryBuilder.getManyAndCount();

    console.log(
      '[AccessLog] 查询结果 - total:',
      total,
      ', data length:',
      data?.length,
    );
    console.log('[AccessLog] 原始数据:', data);

    const result = {
      list: data || [],
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    console.log('[AccessLog] 最终返回结果:', result);

    return result;
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
    try {
      // 获取IP地理位置信息
      const ipGeolocationUtil = IpGeolocationUtil.getInstance();
      const geoInfo = await ipGeolocationUtil.getIpGeolocation(
        createAccessLogDto.ip,
      );

      // 合并地理位置信息到DTO
      const enrichedDto = {
        ...createAccessLogDto,
        country: geoInfo.country || createAccessLogDto.country,
        region: geoInfo.regionName || createAccessLogDto.region,
        province: geoInfo.regionName || createAccessLogDto.province, // 使用regionName作为省份
        city: geoInfo.city || createAccessLogDto.city,
      };

      const accessLog = this.accessLogRepository.create(enrichedDto);
      const savedLog = await this.accessLogRepository.save(accessLog);

      console.log(
        `[AccessLog] 创建访问日志成功: ${createAccessLogDto.ip} -> ${geoInfo.country}, ${geoInfo.city}`,
      );

      return savedLog;
    } catch (error) {
      console.error('[AccessLog] 创建访问日志失败:', error);

      // 如果IP地理位置获取失败，仍然创建访问日志，只是不包含地理信息
      const accessLog = this.accessLogRepository.create(createAccessLogDto);
      return await this.accessLogRepository.save(accessLog);
    }
  }
}
