import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // subject (usually user ID)
  username?: string;
  email?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface TokenResult {
  accessToken: string;
  expiresIn: string;
}

@Injectable()
export class CustomJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 生成访问令牌
   * @param payload JWT载荷数据
   * @returns 返回包含token和过期时间的对象
   */
  async generateToken(payload: JwtPayload): Promise<TokenResult> {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn,
    });

    return {
      accessToken,
      expiresIn,
    };
  }

  /**
   * 验证令牌
   * @param token JWT令牌
   * @returns 返回解码后的载荷数据
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload as JwtPayload;
    } catch {
      throw new Error('Invalid token');
    }
  }

  /**
   * 解码令牌（不验证签名）
   * @param token JWT令牌
   * @returns 返回解码后的载荷数据
   */
  decodeToken(token: string): JwtPayload | null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decoded = this.jwtService.decode(token);
    return decoded as JwtPayload | null;
  }

  /**
   * 生成刷新令牌
   * @param payload JWT载荷数据
   * @param expiresIn 过期时间（可选，默认30天）
   * @returns 返回刷新令牌
   */
  async generateRefreshToken(
    payload: JwtPayload,
    expiresIn: string = '30d',
  ): Promise<string> {
    return await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn,
      },
    );
  }
}
