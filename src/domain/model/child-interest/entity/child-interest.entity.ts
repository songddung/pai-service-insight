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
    private keyword: string,
    private rawScore: number,
    private lastUpdated?: Date,
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

    if (!props.keyword || props.keyword.trim().length === 0) {
      throw new Error('키워드는 필수입니다.');
    }

    if (props.rawScore < 0) {
      throw new Error('점수는 0 이상이어야 합니다.');
    }

    return new ChildInterest(
      null,
      props.childId,
      props.keyword.trim(),
      props.rawScore,
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
      props.keyword,
      props.rawScore,
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
    return this.keyword;
  }

  getRawScore(): number {
    return this.rawScore;
  }

  getLastUpdated(): Date | undefined {
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
    this.rawScore += amount;
    this.lastUpdated = new Date();
  }

  /**
   * 점수 설정
   */
  updateScore(newScore: number): void {
    if (newScore < 0) {
      throw new Error('점수는 0 이상이어야 합니다.');
    }
    this.rawScore = newScore;
    this.lastUpdated = new Date();
  }

  /**
   * 특정 점수 이상인지 확인
   */
  hasScoreAbove(threshold: number): boolean {
    return this.rawScore >= threshold;
  }
}
