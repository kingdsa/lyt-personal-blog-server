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
