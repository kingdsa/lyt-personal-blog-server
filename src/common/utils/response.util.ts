import {
  SuccessResponse,
  ErrorResponse,
  ResponseCode,
  PaginationResponse,
  PaginationData,
} from '../interfaces/api-response.interface';

/**
 * API响应工具类
 * 提供统一的响应格式化方法
 */
export class ResponseUtil {
  /**
   * 生成请求ID
   */
  private static generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建成功响应
   * @param data 响应数据
   * @param msg 响应消息
   * @param code 状态码，默认200
   * @param requestId 请求ID
   */
  static success<T = any>(
    data: T,
    msg: string = '操作成功',
    code: ResponseCode.SUCCESS | ResponseCode.CREATED = ResponseCode.SUCCESS,
    requestId?: string,
  ): SuccessResponse<T> {
    return {
      code,
      data,
      msg,
      timestamp: Date.now(),
      requestId: requestId || this.generateRequestId(),
    };
  }

  /**
   * 创建失败响应
   * @param msg 错误消息
   * @param code 错误状态码
   * @param error 错误详情
   * @param requestId 请求ID
   */
  static error(
    msg: string = '操作失败',
    code: Exclude<
      ResponseCode,
      ResponseCode.SUCCESS | ResponseCode.CREATED
    > = ResponseCode.INTERNAL_SERVER_ERROR,
    error?: { details?: string; stack?: string },
    requestId?: string,
  ): ErrorResponse {
    return {
      code,
      data: null,
      msg,
      timestamp: Date.now(),
      requestId: requestId || this.generateRequestId(),
      error,
    };
  }

  /**
   * 创建分页成功响应
   * @param list 数据列表
   * @param total 总数
   * @param page 当前页码
   * @param pageSize 每页数量
   * @param msg 响应消息
   * @param requestId 请求ID
   */
  static pagination<T = any>(
    list: T[],
    total: number,
    msg: string = '查询成功',
    requestId?: string,
  ): PaginationResponse<T> {
    const paginationData: PaginationData<T> = {
      list,
      total,
    };

    return {
      code: ResponseCode.SUCCESS,
      data: paginationData,
      msg,
      timestamp: Date.now(),
      requestId: requestId || this.generateRequestId(),
    };
  }

  /**
   * 创建创建成功响应
   * @param data 创建的数据
   * @param msg 响应消息
   * @param requestId 请求ID
   */
  static created<T = any>(
    data: T,
    msg: string = '创建成功',
    requestId?: string,
  ): SuccessResponse<T> {
    return this.success(data, msg, ResponseCode.CREATED, requestId);
  }

  /**
   * 创建参数错误响应
   * @param msg 错误消息
   * @param details 错误详情
   * @param requestId 请求ID
   */
  static badRequest(
    msg: string = '请求参数错误',
    details?: string,
    requestId?: string,
  ): ErrorResponse {
    return this.error(
      msg,
      ResponseCode.BAD_REQUEST,
      details ? { details } : undefined,
      requestId,
    );
  }

  /**
   * 创建未授权响应
   * @param msg 错误消息
   * @param requestId 请求ID
   */
  static unauthorized(
    msg: string = '未授权访问',
    requestId?: string,
  ): ErrorResponse {
    return this.error(msg, ResponseCode.UNAUTHORIZED, undefined, requestId);
  }

  /**
   * 创建禁止访问响应
   * @param msg 错误消息
   * @param requestId 请求ID
   */
  static forbidden(
    msg: string = '禁止访问',
    requestId?: string,
  ): ErrorResponse {
    return this.error(msg, ResponseCode.FORBIDDEN, undefined, requestId);
  }

  /**
   * 创建资源未找到响应
   * @param msg 错误消息
   * @param requestId 请求ID
   */
  static notFound(
    msg: string = '资源未找到',
    requestId?: string,
  ): ErrorResponse {
    return this.error(msg, ResponseCode.NOT_FOUND, undefined, requestId);
  }

  /**
   * 创建服务器内部错误响应
   * @param msg 错误消息
   * @param error 错误详情
   * @param requestId 请求ID
   */
  static internalServerError(
    msg: string = '服务器内部错误',
    error?: { details?: string; stack?: string },
    requestId?: string,
  ): ErrorResponse {
    return this.error(
      msg,
      ResponseCode.INTERNAL_SERVER_ERROR,
      error,
      requestId,
    );
  }

  /**
   * 创建服务不可用响应
   * @param msg 错误消息
   * @param requestId 请求ID
   */
  static serviceUnavailable(
    msg: string = '服务暂时不可用',
    requestId?: string,
  ): ErrorResponse {
    return this.error(
      msg,
      ResponseCode.SERVICE_UNAVAILABLE,
      undefined,
      requestId,
    );
  }
}
