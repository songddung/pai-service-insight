import { Injectable, Logger } from '@nestjs/common';
import {
  RecommendationProviderPort,
  RecommendationSearchCriteria,
  RecommendationSearchResult,
} from 'src/application/port/out/recommendation-provider.port';

/**
 * Mock 추천 제공자
 * 실제 공공 API 연동 전까지 사용할 임시 어댑터
 *
 * TODO: 실제 공공 API로 교체
 * - 한국관광공사 Tour API
 * - 문화체육관광부 공연/전시 API
 * - 지자체 체험 프로그램 API 등
 */
@Injectable()
export class MockRecommendationProviderAdapter
  implements RecommendationProviderPort
{
  private readonly logger = new Logger(
    MockRecommendationProviderAdapter.name,
  );

  // Mock 데이터
  private readonly mockData = [
    {
      id: 'rec-001',
      title: '국립과학관 공룡 전시회',
      description:
        '중생대 공룡들의 화석과 복원 모형을 볼 수 있는 특별 전시',
      category: '전시',
      location: '서울 국립과학관',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      imageUrl: 'https://example.com/dino.jpg',
      link: 'https://example.com/dino-exhibition',
    },
    {
      id: 'rec-002',
      title: '어린이 우주 체험 프로그램',
      description: '천체 관측과 로켓 제작 체험을 할 수 있는 교육 프로그램',
      category: '체험',
      location: '부산 천문대',
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      imageUrl: 'https://example.com/space.jpg',
      link: 'https://example.com/space-program',
    },
    {
      id: 'rec-003',
      title: '어린이 미술 축제',
      description: '다양한 미술 작품 전시와 그리기 체험',
      category: '축제',
      location: '대전 예술의전당',
      startDate: '2025-03-01',
      endDate: '2025-03-15',
      imageUrl: 'https://example.com/art.jpg',
      link: 'https://example.com/art-festival',
    },
    {
      id: 'rec-004',
      title: '로봇 코딩 캠프',
      description: '어린이를 위한 로봇 제작 및 코딩 교육',
      category: '체험',
      location: '서울 로봇과학관',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      imageUrl: 'https://example.com/robot.jpg',
      link: 'https://example.com/robot-camp',
    },
    {
      id: 'rec-005',
      title: '동물의 왕국 특별전',
      description: '세계 각국의 동물들을 만날 수 있는 전시',
      category: '전시',
      location: '인천 동물원',
      startDate: '2025-05-01',
      endDate: '2025-06-30',
      imageUrl: 'https://example.com/animal.jpg',
      link: 'https://example.com/animal-exhibition',
    },
  ];

  async searchRecommendations(
    criteria: RecommendationSearchCriteria,
  ): Promise<RecommendationSearchResult> {
    this.logger.log(
      `Mock 추천 검색 - keywords: ${criteria.keywords.join(', ')}, page: ${criteria.page}`,
    );

    // 키워드에 매칭되는 항목 필터링
    let filtered = this.mockData.filter((item) => {
      const searchText =
        `${item.title} ${item.description} ${item.category}`.toLowerCase();
      return criteria.keywords.some((keyword) =>
        searchText.includes(keyword.toLowerCase()),
      );
    });

    // 카테고리 필터 적용
    if (criteria.category) {
      filtered = filtered.filter(
        (item) => item.category === criteria.category,
      );
    }

    // 매칭되는 항목이 없으면 모든 항목 반환
    if (filtered.length === 0) {
      filtered = this.mockData;
    }

    // 페이지네이션
    const startIndex = (criteria.page - 1) * criteria.pageSize;
    const endIndex = startIndex + criteria.pageSize;
    const paginatedItems = filtered.slice(startIndex, endIndex);

    this.logger.log(
      `Mock 추천 검색 결과 - 전체: ${filtered.length}, 반환: ${paginatedItems.length}`,
    );

    return {
      items: paginatedItems,
      totalCount: filtered.length,
    };
  }
}
