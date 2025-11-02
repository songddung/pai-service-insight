export class GetRecommendationsQuery {
  constructor(
    public readonly childId: number,
    public readonly page: number = 1,
    public readonly pageSize: number = 10,
    public readonly category?: string, // 선택적 카테고리 필터 (축제, 전시, 체험 등)
  ) {}
}
