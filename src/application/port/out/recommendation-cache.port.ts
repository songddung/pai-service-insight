import type { RecommendationSearchResult } from './recommendation-provider.port';

export interface RecommendationCachePort {
  // 캐시에서 추천 결과 조회
  findCachedRecommendations(
    keyword: string,
    category?: string,
  ): Promise<RecommendationSearchResult | null>;

  // 캐시에 추천 결과 저장
  cacheRecommendations(
    keyword: string,
    result: RecommendationSearchResult,
    category?: string,
    ttl?: number,
  ): Promise<void>;

  // 캐시된 추천 결과 삭제
  invalidateCachedRecommendations(
    keyword: string,
    category?: string,
  ): Promise<void>;
}
