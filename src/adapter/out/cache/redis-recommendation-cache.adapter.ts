import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';
import type { RecommendationCachePort } from 'src/application/port/out/recommendation-cache.port';
import type { RecommendationSearchResult } from 'src/application/port/out/recommendation-provider.port';

@Injectable()
export class RedisRecommendationCacheAdapter implements RecommendationCachePort {
  private readonly logger = new Logger(RedisRecommendationCacheAdapter.name);
  private readonly KEY_PREFIX = 'recommendation:';
  private readonly DEFAULT_TTL = 3600; // 1시간

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}


  private getCacheKey(keyword: string, category?: string): string {
    const normalizedKeyword = keyword.toLowerCase().trim();
    return category
      ? `${this.KEY_PREFIX}${normalizedKeyword}:${category}`
      : `${this.KEY_PREFIX}${normalizedKeyword}`;
  }

  async findCachedRecommendations(
    keyword: string,
    category?: string,
  ): Promise<RecommendationSearchResult | null> {
    try {
      const cacheKey = this.getCacheKey(keyword, category);
      const cached = await this.redis.get(cacheKey);

      if (!cached) {
        this.logger.log(
          `캐시 미스 - keyword: ${keyword}, category: ${category || 'all'}`,
        );
        return null;
      }

      this.logger.log(
        `캐시 히트 - keyword: ${keyword}, category: ${category || 'all'}`,
      );
      return JSON.parse(cached) as RecommendationSearchResult;
    } catch (error) {
      this.logger.error('캐시 조회 실패:', error);
      return null;
    }
  }

  async cacheRecommendations(
    keyword: string,
    result: RecommendationSearchResult,
    category?: string,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(keyword, category);
      await this.redis.setex(cacheKey, ttl, JSON.stringify(result));

      this.logger.log(
        `캐시 저장 완료 - keyword: ${keyword}, category: ${category || 'all'}, items: ${result.items.length}, TTL: ${ttl}초`,
      );
    } catch (error) {
      this.logger.error('캐시 저장 실패:', error);
    }
  }

  async invalidateCachedRecommendations(
    keyword: string,
    category?: string,
  ): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(keyword, category);
      await this.redis.del(cacheKey);

      this.logger.log(
        `캐시 삭제 완료 - keyword: ${keyword}, category: ${category || 'all'}`,
      );
    } catch (error) {
      this.logger.error('캐시 삭제 실패:', error);
    }
  }
}
