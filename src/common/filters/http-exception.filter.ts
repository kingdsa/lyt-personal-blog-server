import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response.util';
import { ResponseCode } from '../interfaces/api-response.interface';

/**
 * 全局HTTP异常过滤器
 * 统一处理所有HTTP异常并返回标准格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] as string;

    let status: number;
    let message: string;
    let error: { details?: string; stack?: string } | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        // Type-safe handling of exception response object
        const responseObj = exceptionResponse as Record<string, unknown>;

        // Extract message with proper type checking
        let extractedMessage: string | undefined;
        if (typeof responseObj.message === 'string') {
          extractedMessage = responseObj.message;
        } else if (Array.isArray(responseObj.message)) {
          // Handle validation errors with array of messages
          const messageArray = responseObj.message.filter(
            (msg): msg is string => typeof msg === 'string',
          );
          extractedMessage =
            messageArray.length > 0 ? messageArray.join(', ') : undefined;
        } else if (typeof responseObj.error === 'string') {
          extractedMessage = responseObj.error;
        }

        message = extractedMessage || exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || '服务器内部错误';
      error = {
        details: exception.message,
        stack:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '未知错误';
      error = {
        details: String(exception),
      };
    }

    // 记录错误日志
    this.logger.error(
      `HTTP Exception: ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      `${request.method} ${request.url}`,
    );

    // 映射HTTP状态码到自定义响应码
    const responseCode = this.mapHttpStatusToResponseCode(status);

    const errorResponse = ResponseUtil.error(
      message,
      responseCode as Exclude<
        ResponseCode,
        ResponseCode.SUCCESS | ResponseCode.CREATED
      >,
      error,
      requestId,
    );

    response.status(status).json(errorResponse);
  }

  /**
   * 映射HTTP状态码到自定义响应码
   */
  private mapHttpStatusToResponseCode(httpStatus: number): ResponseCode {
    switch (httpStatus) {
      case 400: // HttpStatus.BAD_REQUEST
        return ResponseCode.BAD_REQUEST;
      case 401: // HttpStatus.UNAUTHORIZED
        return ResponseCode.UNAUTHORIZED;
      case 403: // HttpStatus.FORBIDDEN
        return ResponseCode.FORBIDDEN;
      case 404: // HttpStatus.NOT_FOUND
        return ResponseCode.NOT_FOUND;
      case 503: // HttpStatus.SERVICE_UNAVAILABLE
        return ResponseCode.SERVICE_UNAVAILABLE;
      default:
        return ResponseCode.INTERNAL_SERVER_ERROR;
    }
  }
}
