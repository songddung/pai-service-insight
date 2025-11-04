/**
 * InterestUpdatedEvent
 *
 * ChildInterest가 업데이트되었을 때 발행되는 도메인 이벤트
 * - 추천 시스템 캐시 무효화 트리거 가능
 * - 분석 시스템에 변경 사항 알림 가능
 */
export class InterestUpdatedEvent {
  constructor(
    public readonly interestId: bigint,
    public readonly childId: number,
    public readonly keyword: string,
    public readonly previousScore: number,
    public readonly newScore: number,
    public readonly updatedAt: Date,
  ) {}

  /**
   * 이벤트 타입 식별자
   */
  static readonly EVENT_TYPE = 'interest.updated';

  getEventType(): string {
    return InterestUpdatedEvent.EVENT_TYPE;
  }

  /**
   * 점수가 증가했는지 확인
   */
  isScoreIncreased(): boolean {
    return this.newScore > this.previousScore;
  }

  /**
   * 점수 변화량 계산
   */
  getScoreChange(): number {
    return this.newScore - this.previousScore;
  }
}
