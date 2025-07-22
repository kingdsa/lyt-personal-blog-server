import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserSubModule } from './user/user.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [AuthModule, UserSubModule, CommonModule],
  exports: [AuthModule, UserSubModule],
})
export class UserModule {}
