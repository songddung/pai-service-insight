import { ExtractedKeywords } from '../vo/extracted-keywords.vo';

// 신규 생성용 Props
interface CreateAnalyticsProps {
  childId: number;
  conversationId: bigint;
  extractedKeywords: ExtractedKeywords;
}

// DB 재구성용 Props
interface RehydrateAnalyticsProps extends CreateAnalyticsProps {
  id: bigint;
  createdAt: Date;
}

/**
 * Analytics 엔티티
 * - 대화에서 추출된 키워드를 저장
 * - child_interests 업데이트의 트리거 역할
 */
export class Analytics {
  private constructor(
    private readonly id: bigint | null,
    private readonly childId: number,
    private readonly conversationId: bigint,
    private readonly extractedKeywords: ExtractedKeywords,
    private readonly createdAt?: Date,
  ) {}

  // =============================
  // ✅ 팩토리 메서드
  // =============================

  /**
   * 신규 Analytics 생성
   */
  static create(props: CreateAnalyticsProps): Analytics {
    // 비즈니스 규칙 검증
    if (!props.childId) {
      throw new Error('아이 ID는 필수입니다.');
    }

    if (!props.conversationId) {
      throw new Error('대화 ID는 필수입니다.');
    }

    return new Analytics(
      null, // ID는 저장 시 생성
      props.childId,
      props.conversationId,
      props.extractedKeywords,
      undefined, // createdAt은 저장 시 생성
    );
  }

  /**
   * DB에서 로드된 데이터로 엔티티 재구성
   */
  static rehydrate(props: RehydrateAnalyticsProps): Analytics {
    return new Analytics(
      props.id,
      props.childId,
      props.conversationId,
      props.extractedKeywords,
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

  getConversationId(): bigint {
    return this.conversationId;
  }

  getExtractedKeywords(): ExtractedKeywords {
    return this.extractedKeywords;
  }

  getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  // =============================
  // ✅ 비즈니스 로직
  // =============================

  /**
   * 키워드가 추출되었는지 확인
   */
  hasKeywords(): boolean {
    return !this.extractedKeywords.isEmpty();
  }

  /**
   * 특정 키워드가 포함되어 있는지 확인
   */
  containsKeyword(keyword: string): boolean {
    return this.extractedKeywords.contains(keyword);
  }

  /**
   * 추출된 키워드 개수
   */
  getKeywordCount(): number {
    return this.extractedKeywords.getCount();
  }

  /**
   * child_interests 업데이트가 필요한지 확인
   */
  shouldUpdateInterests(): boolean {
    return this.hasKeywords();
  }
}
