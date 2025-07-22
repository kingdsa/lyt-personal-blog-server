import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryCount?: number;
  retryDelay?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export class HttpClient {
  private axiosInstance: AxiosInstance;
  private retryCount: number;
  private retryDelay: number;

  constructor(config: HttpClientConfig = {}) {
    this.retryCount = config.retryCount || 3;
    this.retryDelay = config.retryDelay || 1000;

    this.axiosInstance = axios.create({
      baseURL: config.baseURL || '',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LYT-Personal-Blog-Server/1.0.0',
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const startTime = Date.now();
        config.metadata = { startTime };
        return config;
      },
      (error: AxiosError) => {
        console.error('[HTTP] ❌ Request Error:', error.message);
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & {
          _retryCount?: number;
        };

        // 计算请求时长
        const endTime = Date.now();
        const startTime = config?.metadata?.startTime || endTime;
        const duration = endTime - startTime;

        const status = error.response?.status || 0;
        const method = config?.method?.toUpperCase() || 'UNKNOWN';
        const url = config?.url || 'unknown';

        console.error(
          `[HTTP] ❌ ${status} ${method} ${url} - ${duration}ms - ${error.message}`,
        );

        // 重试逻辑
        if (this.shouldRetry(error) && config) {
          config._retryCount = config._retryCount || 0;

          if (config._retryCount < this.retryCount) {
            config._retryCount++;

            await this.delay(this.retryDelay * config._retryCount);
            return this.axiosInstance(config);
          }
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // 重试条件：网络错误、超时、5xx服务器错误
    return (
      !error.response ||
      error.code === 'ECONNABORTED' ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private handleError(error: AxiosError): Error {
    const errorData = error.response?.data as { message?: string } | undefined;
    const message = errorData?.message || error.message || '请求失败';
    const status = error.response?.status;
    const statusText = error.response?.statusText;

    return new Error(
      `HTTP Error ${status ? `${status} ${statusText}: ` : ''}${message}`,
    );
  }

  // GET 请求
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.get<T>(url, config);
    return this.formatResponse(response);
  }

  // POST 请求
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return this.formatResponse(response);
  }

  // PUT 请求
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return this.formatResponse(response);
  }

  // DELETE 请求
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return this.formatResponse(response);
  }

  // PATCH 请求
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return this.formatResponse(response);
  }

  // 通用请求方法
  async request<T = any>(config: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.request<T>(config);
    return this.formatResponse(response);
  }

  // 格式化响应
  private formatResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  // 设置默认请求头
  setDefaultHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  // 移除默认请求头
  removeDefaultHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }

  // 获取axios实例（高级用法）
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// 创建默认的HTTP客户端实例
export const httpClient = new HttpClient();

// 扩展axios类型定义
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}
