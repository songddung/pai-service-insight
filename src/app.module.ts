import { Module } from '@nestjs/common';
import { InsightModule } from './insight.module';

@Module({
  imports: [InsightModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
