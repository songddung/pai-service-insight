/**
 * AnalyticsCreatedEvent
 *
 * Analytics가 생성되었을 때 발행되는 도메인 이벤트
 * - ChildInterest 업데이트를 트리거
 * - 다른 바운디드 컨텍스트에 알림 가능
 */
export class AnalyticsCreatedEvent {
  constructor(
    public readonly analyticsId: bigint,
    public readonly childId: number,
    public readonly conversationId: bigint,
    public readonly extractedKeywords: string[],
    public readonly createdAt: Date,
  ) {}

  /**
   * 이벤트 타입 식별자
   */
  static readonly EVENT_TYPE = 'analytics.created';

  getEventType(): string {
    return AnalyticsCreatedEvent.EVENT_TYPE;
  }

  /**
   * 키워드가 추출되었는지 확인
   */
  hasKeywords(): boolean {
    return this.extractedKeywords.length > 0;
  }
}
