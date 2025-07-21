import { HttpClient } from './http-client.util';

export interface IpGeolocationInfo {
  status: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  query?: string;
}

export class IpGeolocationUtil {
  private static instance: IpGeolocationUtil;
  private httpClient: HttpClient;
  private cache: Map<string, { data: IpGeolocationInfo; timestamp: number }> =
    new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时缓存

  private constructor() {
    this.httpClient = new HttpClient({
      baseURL: 'http://ip-api.com',
      timeout: 5000, // 5秒超时
      retryCount: 2, // IP-API服务比较稳定，只重试2次
      retryDelay: 500, // 500ms重试延迟
      headers: {
        Accept: 'application/json',
      },
    });
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): IpGeolocationUtil {
    if (!IpGeolocationUtil.instance) {
      IpGeolocationUtil.instance = new IpGeolocationUtil();
    }
    return IpGeolocationUtil.instance;
  }

  /**
   * 获取IP地理位置信息
   * @param ip IP地址
   * @returns 地理位置信息
   */
  public async getIpGeolocation(ip: string): Promise<IpGeolocationInfo> {
    try {
      // 校验IP格式
      if (!this.isValidIp(ip)) {
        throw new Error(`无效的IP地址: ${ip}`);
      }

      // 检查缓存
      const cached = this.getFromCache(ip);
      if (cached) {
        console.log(`[IP-API] 从缓存获取IP信息: ${ip}`);
        return cached;
      }

      // 发起API请求
      const response = await this.httpClient.get<IpGeolocationInfo>(
        `/json/${ip}`,
        {
          params: {
            fields:
              'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query',
          },
        },
      );

      const data = response.data;

      // 检查API返回状态
      if (data.status !== 'success') {
        throw new Error(`IP-API返回错误: ${data.status}`);
      }

      // 缓存结果
      this.setToCache(ip, data);

      console.log(
        `[IP-API] 成功获取IP地理信息: ${ip} -> ${data.country}, ${data.regionName}, ${data.city}`,
      );

      return data;
    } catch (error) {
      console.error(`[IP-API] 获取IP地理信息失败: ${ip}`, error);

      // 返回默认值而不是抛出错误，确保不影响主要业务流程
      return {
        status: 'fail',
        country: '',
        region: '',
        city: '',
        query: ip,
      };
    }
  }

  /**
   * 批量获取IP地理位置信息
   * @param ips IP地址数组
   * @returns 地理位置信息数组
   */
  public async getBatchIpGeolocation(
    ips: string[],
  ): Promise<IpGeolocationInfo[]> {
    const promises = ips.map((ip) => this.getIpGeolocation(ip));
    return await Promise.allSettled(promises).then((results) =>
      results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`[IP-API] 批量请求失败: ${ips[index]}`, result.reason);
          return {
            status: 'fail',
            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            query: ips[index],
          };
        }
      }),
    );
  }

  /**
   * 校验IP地址格式
   */
  private isValidIp(ip: string): boolean {
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * 从缓存获取数据
   */
  private getFromCache(ip: string): IpGeolocationInfo | null {
    const cached = this.cache.get(ip);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // 清除过期缓存
    if (cached) {
      this.cache.delete(ip);
    }

    return null;
  }

  /**
   * 设置缓存
   */
  private setToCache(ip: string, data: IpGeolocationInfo): void {
    this.cache.set(ip, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除所有缓存
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('[IP-API] 缓存已清空');
  }

  /**
   * 获取缓存统计信息
   */
  public getCacheStats(): { total: number; size: string } {
    const total = this.cache.size;
    const size = `${JSON.stringify(Array.from(this.cache.entries())).length} bytes`;
    return { total, size };
  }
}
