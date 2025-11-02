export interface RecommendationResultItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  link?: string;
  relevantKeywords: string[];
}

export interface GetRecommendationsResult {
  recommendations: RecommendationResultItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
