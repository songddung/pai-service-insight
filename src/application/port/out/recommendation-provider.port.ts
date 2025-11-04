export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  link?: string;
  mapX?: number; // 경도 (longitude)
  mapY?: number; // 위도 (latitude)
  distance?: number; // 사용자로부터의 거리 (km)
}

export interface RecommendationSearchCriteria {
  keyword: string; // 검색할 키워드
  category?: string; // 카테고리 필터
}

export interface RecommendationSearchResult {
  items: RecommendationItem[];
  totalCount: number;
}

/**
 * 외부 추천 콘텐츠 제공자 Port
 * 공공 API (한국관광공사, 문화체육관광부 등)를 호출하여
 * 아이의 관심사 기반 추천 콘텐츠를 가져옵니다.
 */
export interface RecommendationProviderPort {
  /**
   * 키워드 기반으로 추천 콘텐츠 검색
   */
  searchRecommendations(
    criteria: RecommendationSearchCriteria,
  ): Promise<RecommendationSearchResult>;
}
