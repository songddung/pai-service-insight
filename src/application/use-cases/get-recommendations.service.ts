import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetRecommendationsUseCase } from '../port/in/get-recommendations.use-case';
import { GetRecommendationsQuery } from '../command/get-recommendations.command';
import { GetRecommendationsResult } from '../port/in/result/get-recommendations.result.dto';
import type { ChildInterestQueryPort } from '../port/out/child-interest.query.port';
import type { RecommendationProviderPort } from '../port/out/recommendation-provider.port';
import type { ProfileQueryPort } from '../port/out/profile.query.port';
import type { UserLocationQueryPort } from '../port/out/user-location.query.port';
import { INSIGHT_TOKENS } from 'src/insight.token';
import { KeywordMatchingService } from 'src/domain/service/keyword-matching.service';
import { LocationDistanceService } from 'src/domain/service/location-distance.service';

@Injectable()
export class GetRecommendationsService implements GetRecommendationsUseCase {
  private readonly logger = new Logger(GetRecommendationsService.name);

  constructor(
    @Inject(INSIGHT_TOKENS.ChildInterestQueryPort)
    private readonly childInterestQuery: ChildInterestQueryPort,

    @Inject(INSIGHT_TOKENS.RecommendationProviderPort)
    private readonly recommendationProvider: RecommendationProviderPort,

    @Inject(INSIGHT_TOKENS.ProfileQueryPort)
    private readonly profileQuery: ProfileQueryPort,

    @Inject(INSIGHT_TOKENS.UserLocationQueryPort)
    private readonly userLocationQuery: UserLocationQueryPort,

    private readonly keywordMatchingService: KeywordMatchingService,
    private readonly locationDistanceService: LocationDistanceService,
  ) {}

  async execute(
    query: GetRecommendationsQuery,
  ): Promise<GetRecommendationsResult> {
    this.logger.log(
      `추천 콘텐츠 조회 시작 - childId: ${query.childId}, page: ${query.page}`,
    );

    // 1. 아이의 상위 관심사 조회
    const topInterests = await this.childInterestQuery.findTopByChildId(
      query.childId,
      1, // 가장 높은 관심사 1개만
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
    const keyword = topInterests[0].getKeyword();

    // 2. Profile 정보 조회 -> User ID 획득
    const profile = await this.profileQuery.findById(query.childId);
    let userLocation: { latitude: number; longitude: number } | null = null;

    if (profile) {
      this.logger.log(
        `Profile 조회 성공 - profileId: ${query.childId}, userId: ${profile.userId}`,
      );

      // 3. User 위치 정보 조회
      const locationData = await this.userLocationQuery.findLocationByUserId(
        profile.userId,
      );

      if (locationData) {
        userLocation = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };
        this.logger.log(
          `User 위치 조회 성공 - userId: ${profile.userId}, lat: ${userLocation.latitude}, lon: ${userLocation.longitude}`,
        );
      } else {
        this.logger.warn(
          `User 위치 조회 실패 - userId: ${profile.userId}. 위치 기반 정렬 없이 진행합니다.`,
        );
      }
    } else {
      this.logger.warn(
        `Profile 조회 실패 - profileId: ${query.childId}. 위치 기반 정렬 없이 진행합니다.`,
      );
    }

    // 4. 외부 API 호출하여 추천 콘텐츠 검색 (모든 결과 조회)
    const searchResult =
      await this.recommendationProvider.searchRecommendations({
        keyword,
        category: query.category,
      });

    // 5. 위치 기반 거리 계산 및 정렬 (Domain Service 활용)
    let sortedItems = searchResult.items;
    if (userLocation) {
      const itemsWithDistance = this.locationDistanceService.addDistanceAndSort(
        searchResult.items,
        userLocation,
      );
      // ItemWithDistance를 다시 RecommendationItem 타입으로 캐스팅
      sortedItems = itemsWithDistance as any;
      this.logger.log(
        `위치 기반 정렬 완료 - 기준 위치: (${userLocation.latitude}, ${userLocation.longitude})`,
      );
    }

    // 6. 키워드 매칭 추가
    const itemsWithKeywords = sortedItems.map((item) => ({
      ...item,
      relevantKeywords: this.keywordMatchingService.findRelevantKeyword(
        item,
        keyword,
      ),
    }));

    // 7. 페이지네이션 적용 (Application Layer에서 처리)
    const startIndex = (query.page - 1) * query.pageSize;
    const endIndex = startIndex + query.pageSize;
    const paginatedItems = itemsWithKeywords.slice(startIndex, endIndex);

    const totalCount = itemsWithKeywords.length;
    const hasMore = endIndex < totalCount;

    this.logger.log(
      `추천 콘텐츠 조회 완료 - 결과 수: ${paginatedItems.length}, 전체: ${totalCount}, 페이지: ${query.page}/${Math.ceil(totalCount / query.pageSize)}`,
    );

    return {
      recommendations: paginatedItems,
      totalCount,
      page: query.page,
      pageSize: query.pageSize,
      hasMore,
    };
  }
}
