import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // ✅ 어느 모듈에서도 PrismaService를 import 없이 사용 가능하게 함
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
