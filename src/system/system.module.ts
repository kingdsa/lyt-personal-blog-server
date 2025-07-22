import { Module } from '@nestjs/common';
import { AccessLogModule } from './access-log/access-log.module';
import { TokenModule } from './token/token.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [AccessLogModule, TokenModule, CommonModule],
  exports: [AccessLogModule, TokenModule],
})
export class SystemModule {}
