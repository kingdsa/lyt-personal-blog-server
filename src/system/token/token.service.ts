import { Injectable } from '@nestjs/common';
import { CustomJwtService, JwtPayload } from '@/common';
import { GenerateTokenDto } from './dto';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: CustomJwtService) {}

  /**
   * 生成Token
   */
  async generateToken(payload: GenerateTokenDto) {
    const jwtPayload: JwtPayload = {
      sub: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };

    return await this.jwtService.generateToken(jwtPayload);
  }

  /**
   * 验证Token
   */
  async verifyToken(token: string) {
    return await this.jwtService.verifyToken(token);
  }

  /**
   * 解码Token（不验证签名）
   */
  decodeToken(token: string) {
    return this.jwtService.decodeToken(token);
  }
}
