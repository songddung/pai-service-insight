import { Keyword } from '../vo/keyword.vo';
import { Score } from '../vo/score.vo';

// 신규 생성용 Props
interface CreateChildInterestProps {
  childId: number;
  keyword: string;
  rawScore: number;
}

// DB 재구성용 Props
interface RehydrateChildInterestProps extends CreateChildInterestProps {
  id: bigint;
  lastUpdated: Date;
  createdAt: Date;
}

/**
 * ChildInterest 엔티티
 * - 아이의 관심사 키워드와 점수 저장
 * - Analytics에서 추출된 키워드로 업데이트됨
 */
export class ChildInterest {
  private constructor(
    private readonly id: bigint | null,
    private readonly childId: number,
    private keyword: Keyword,
    private rawScore: Score,
    private lastUpdated: Date,
    private readonly createdAt?: Date,
  ) {}

  // =============================
  // ✅ 팩토리 메서드
  // =============================

  /**
   * 신규 ChildInterest 생성
   */
  static create(props: CreateChildInterestProps): ChildInterest {
    if (!props.childId) {
      throw new Error('아이 ID는 필수입니다.');
    }

    // VO가 유효성 검증을 담당
    const keyword = Keyword.create(props.keyword);
    const score = Score.create(props.rawScore);

    return new ChildInterest(
      null,
      props.childId,
      keyword,
      score,
      new Date(), // 현재 시간
      undefined,
    );
  }

  /**
   * DB에서 로드된 데이터로 재구성
   */
  static rehydrate(props: RehydrateChildInterestProps): ChildInterest {
    return new ChildInterest(
      props.id,
      props.childId,
      Keyword.create(props.keyword),
      Score.create(props.rawScore),
      props.lastUpdated,
      props.createdAt,
    );
  }

  // =============================
  // ✅ Getters
  // =============================

  getId(): bigint | null {
    return this.id;
  }

  getChildId(): number {
    return this.childId;
  }

  getKeyword(): string {
    return this.keyword.getValue();
  }

  getRawScore(): number {
    return this.rawScore.getValue();
  }

  getLastUpdated(): Date {
    return this.lastUpdated;
  }

  getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  // =============================
  // ✅ 비즈니스 로직
  // =============================

  /**
   * 점수 증가 (같은 키워드가 다시 나왔을 때)
   */
  incrementScore(amount: number = 1.0): void {
    if (amount <= 0) {
      throw new Error('증가량은 0보다 커야 합니다.');
    }
    this.rawScore = this.rawScore.add(amount);
    this.lastUpdated = new Date();
  }

  /**
   * 점수 설정
   */
  updateScore(newScore: number): void {
    this.rawScore = Score.create(newScore); // VO가 유효성 검증
    this.lastUpdated = new Date();
  }

  /**
   * 특정 점수 이상인지 확인
   */
  hasScoreAbove(threshold: number): boolean {
    return this.rawScore.isAbove(threshold - 0.01); // isAbove는 초과이므로 보정
  }
}
