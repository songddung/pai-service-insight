import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// Controllers
import { InsightController } from './adapter/in/http/controllers/insight.controller';

// Tokens
import { INSIGHT_TOKENS } from './insight.token';

// UseCase 구현체
import { CreateAnalyticsService } from './application/use-cases/create-analytics.service';
import { GetTopInterestsService } from './application/use-cases/get-top-interests.service';
import { PruneOldInterestsService } from './application/use-cases/prune-old-interests.service';
import { GetRecommendationsService } from './application/use-cases/get-recommendations.service';

// Repository Adapter 구현체
import { AnalyticsRepositoryAdapter } from './adapter/out/persistence/analytics/analytics.repository.adapter';
import { ChildInterestRepositoryAdapter } from './adapter/out/persistence/child-interest/child-interest.repository.adapter';

// Prisma Module
import { PrismaModule } from './adapter/out/persistence/prisma/prisma.module';

// Mapper
import { InsightMapper } from './adapter/in/http/mapper/insight.mapper';

// Guard
import { BasicAuthGuard } from './adapter/in/http/auth/guards/basic-auth.guard';

// Redis Module
import { RedisModule } from './adapter/out/cache/redis.module';

// Query Adapter 구현체
import { RedisTokenVersionQueryAdapter } from './adapter/out/cache/redis-token-version.query.adapter';
import { ChildInterestQueryAdapter } from './adapter/out/persistence/child-interest/child-interest.query.adapter';

// Scheduler
import { PruneInterestsScheduler } from './adapter/in/scheduler/prune-interests.scheduler';

// External Adapter 구현체
import { MockRecommendationProviderAdapter } from './adapter/out/external/mock-recommendation-provider.adapter';

@Module({
  imports: [ScheduleModule.forRoot(), RedisModule, PrismaModule],
  controllers: [InsightController],
  providers: [
    // Guard
    BasicAuthGuard,

    // Mapper
    InsightMapper,

    // Scheduler
    PruneInterestsScheduler,

    // UseCase 바인딩
    {
      provide: INSIGHT_TOKENS.CreateAnalyticsUseCase,
      useClass: CreateAnalyticsService,
    },
    {
      provide: INSIGHT_TOKENS.GetTopInterestsUseCase,
      useClass: GetTopInterestsService,
    },
    {
      provide: INSIGHT_TOKENS.PruneOldInterestsUseCase,
      useClass: PruneOldInterestsService,
    },
    {
      provide: INSIGHT_TOKENS.GetRecommendationsUseCase,
      useClass: GetRecommendationsService,
    },

    // Query 바인딩 (읽기)
    {
      provide: INSIGHT_TOKENS.TokenVersionQueryPort,
      useClass: RedisTokenVersionQueryAdapter,
    },
    {
      provide: INSIGHT_TOKENS.ChildInterestQueryPort,
      useClass: ChildInterestQueryAdapter,
    },

    // Repository 바인딩 (쓰기)
    {
      provide: INSIGHT_TOKENS.AnalyticsRepositoryPort,
      useClass: AnalyticsRepositoryAdapter,
    },
    {
      provide: INSIGHT_TOKENS.ChildInterestRepositoryPort,
      useClass: ChildInterestRepositoryAdapter,
    },

    // External Services 바인딩
    {
      provide: INSIGHT_TOKENS.RecommendationProviderPort,
      useClass: MockRecommendationProviderAdapter,
    },
  ],
})
export class InsightModule {}
