import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetRecommendationsUseCase } from '../port/in/get-recommendations.use-case';
import { GetRecommendationsQuery } from '../command/get-recommendations.command';
import { GetRecommendationsResult } from '../port/in/result/get-recommendations.result.dto';
import type { ChildInterestQueryPort } from '../port/out/child-interest.query.port';
import type { RecommendationProviderPort } from '../port/out/recommendation-provider.port';
import { INSIGHT_TOKENS } from 'src/insight.token';
import { KeywordMatchingService } from 'src/domain/service/keyword-matching.service';

@Injectable()
export class GetRecommendationsService implements GetRecommendationsUseCase {
  private readonly logger = new Logger(GetRecommendationsService.name);

  constructor(
    @Inject(INSIGHT_TOKENS.ChildInterestQueryPort)
    private readonly childInterestQuery: ChildInterestQueryPort,

    @Inject(INSIGHT_TOKENS.RecommendationProviderPort)
    private readonly recommendationProvider: RecommendationProviderPort,

    private readonly keywordMatchingService: KeywordMatchingService,
  ) {}

  async execute(
    query: GetRecommendationsQuery,
  ): Promise<GetRecommendationsResult> {
    this.logger.log(
      `추천 콘텐츠 조회 시작 - childId: ${query.childId}, page: ${query.page}`,
    );

    // 1. 아이의 상위 관심사 조회 (상위 5개)
    const topInterests = await this.childInterestQuery.findTopByChildId(
      query.childId,
      5,
    );

    if (topInterests.length === 0) {
      this.logger.warn(
        `childId ${query.childId}에 대한 관심사가 없습니다. 빈 추천 결과를 반환합니다.`,
      );
      return {
        recommendations: [],
        totalCount: 0,
        page: query.page,
        pageSize: query.pageSize,
        hasMore: false,
      };
    }

    // 2. 관심사 키워드 추출
    const keywords = topInterests.map((interest) => interest.getKeyword());
    this.logger.log(`추출된 키워드: ${keywords.join(', ')}`);

    // 3. 외부 API 호출하여 추천 콘텐츠 검색
    const searchResult = await this.recommendationProvider.searchRecommendations(
      {
        keywords,
        category: query.category,
        page: query.page,
        pageSize: query.pageSize,
      },
    );

    // 4. 결과 매핑 (각 추천 항목에 매칭된 키워드 추가)
    const recommendations = searchResult.items.map((item) => ({
      ...item,
      relevantKeywords: this.keywordMatchingService.findRelevantKeywords(
        item,
        keywords,
      ),
    }));

    const hasMore = query.page * query.pageSize < searchResult.totalCount;

    this.logger.log(
      `추천 콘텐츠 조회 완료 - 결과 수: ${recommendations.length}, 전체: ${searchResult.totalCount}`,
    );

    return {
      recommendations,
      totalCount: searchResult.totalCount,
      page: query.page,
      pageSize: query.pageSize,
      hasMore,
    };
  }
}
