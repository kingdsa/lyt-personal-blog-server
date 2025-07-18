/**
 * 统一API响应接口定义
 * 按照企业级标准设计的响应格式
 */

/**
 * API响应状态码枚举
 */
export enum ResponseCode {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * 基础API响应接口
 */
export interface ApiResponse<T = any> {
  /**
   * 响应状态码
   */
  code: number;

  /**
   * 响应数据
   */
  data: T;

  /**
   * 响应消息
   */
  msg: string;

  /**
   * 时间戳
   */
  timestamp?: number;

  /**
   * 请求ID（用于链路追踪）
   */
  requestId?: string;
}

/**
 * 成功响应接口
 */
export interface SuccessResponse<T = any> extends ApiResponse<T> {
  code: ResponseCode.SUCCESS | ResponseCode.CREATED;
  data: T;
  msg: string;
}

/**
 * 错误响应接口
 */
export interface ErrorResponse extends ApiResponse<null> {
  code: Exclude<ResponseCode, ResponseCode.SUCCESS | ResponseCode.CREATED>;
  data: null;
  msg: string;
  error?: {
    details?: string;
    stack?: string;
  };
}

/**
 * 分页数据接口
 */
export interface PaginationData<T = any> {
  /**
   * 数据列表
   */
  list: T[];

  /**
   * 总数
   */
  total: number;
}

/**
 * 分页响应接口
 */
export interface PaginationResponse<T = any>
  extends SuccessResponse<PaginationData<T>> {
  data: PaginationData<T>;
}
