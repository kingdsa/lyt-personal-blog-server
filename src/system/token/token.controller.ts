import { Controller, Post, Body } from '@nestjs/common';
import { TokenService } from './token.service';
import { GenerateTokenDto, VerifyTokenDto, DecodeTokenDto } from './dto';
import {
  ApiResponse,
  ResponseCode,
} from '../../common/interfaces/api-response.interface';

@Controller('system/token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('generate')
  async generateToken(@Body() payload: GenerateTokenDto): Promise<ApiResponse> {
    try {
      const tokenResult = await this.tokenService.generateToken(payload);
      return {
        code: ResponseCode.SUCCESS,
        msg: 'Token生成成功',
        data: tokenResult,
      };
    } catch {
      return {
        code: ResponseCode.INTERNAL_SERVER_ERROR,
        msg: 'Token生成失败',
        data: null,
      };
    }
  }

  @Post('verify')
  async verifyToken(@Body() body: VerifyTokenDto): Promise<ApiResponse> {
    try {
      const payload = await this.tokenService.verifyToken(body.token);
      return {
        code: ResponseCode.SUCCESS,
        msg: 'Token验证成功',
        data: payload,
      };
    } catch {
      return {
        code: ResponseCode.UNAUTHORIZED,
        msg: 'Token无效或已过期',
        data: null,
      };
    }
  }

  @Post('decode')
  decodeToken(@Body() body: DecodeTokenDto): ApiResponse {
    try {
      const payload = this.tokenService.decodeToken(body.token);
      return {
        code: ResponseCode.SUCCESS,
        msg: 'Token解码成功',
        data: payload,
      };
    } catch {
      return {
        code: ResponseCode.BAD_REQUEST,
        msg: 'Token格式错误',
        data: null,
      };
    }
  }
}
