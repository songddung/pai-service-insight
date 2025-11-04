/**
 * InterestCreatedEvent
 *
 * 새로운 ChildInterest가 생성되었을 때 발행되는 도메인 이벤트
 * - 추천 시스템에 새로운 관심사 알림
 * - 분석 대시보드 업데이트 트리거 가능
 */
export class InterestCreatedEvent {
  constructor(
    public readonly interestId: bigint,
    public readonly childId: number,
    public readonly keyword: string,
    public readonly initialScore: number,
    public readonly createdAt: Date,
  ) {}

  /**
   * 이벤트 타입 식별자
   */
  static readonly EVENT_TYPE = 'interest.created';

  getEventType(): string {
    return InterestCreatedEvent.EVENT_TYPE;
  }

  /**
   * 높은 초기 점수를 가진 관심사인지 확인
   */
  isHighInterest(threshold: number = 5.0): boolean {
    return this.initialScore >= threshold;
  }
}
