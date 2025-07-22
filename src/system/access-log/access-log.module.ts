import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessLogController } from './access-log.controller';
import { AccessLogService } from './access-log.service';
import { AccessLog } from '../../entities';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLog]), CommonModule],
  controllers: [AccessLogController],
  providers: [AccessLogService],
  exports: [AccessLogService],
})
export class AccessLogModule {}
