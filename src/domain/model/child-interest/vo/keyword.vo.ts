/**
 * Keyword Value Object
 *
 * 관심사 키워드를 나타내는 VO
 * - 불변성 보장
 * - 유효성 검증
 * - 정규화 (트림, 소문자 변환 등)
 */
export class Keyword {
  private readonly value: string;

  private constructor(keyword: string) {
    this.value = keyword;
  }

  /**
   * Keyword VO 생성
   *
   * @param keyword 키워드 문자열
   * @returns Keyword VO
   * @throws Error 유효하지 않은 키워드인 경우
   */
  static create(keyword: string): Keyword {
    // 유효성 검증
    if (!keyword || typeof keyword !== 'string') {
      throw new Error('키워드는 문자열이어야 합니다.');
    }

    const trimmed = keyword.trim();

    if (trimmed.length === 0) {
      throw new Error('키워드는 비어있을 수 없습니다.');
    }

    if (trimmed.length > 100) {
      throw new Error('키워드는 100자를 초과할 수 없습니다.');
    }

    // 특수문자만으로 구성된 키워드 방지
    if (!/[a-zA-Z0-9가-힣]/.test(trimmed)) {
      throw new Error('키워드는 최소 하나의 문자나 숫자를 포함해야 합니다.');
    }

    return new Keyword(trimmed);
  }

  /**
   * 키워드 값 반환
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 정규화된 키워드 반환 (비교용)
   */
  getNormalized(): string {
    return this.value.toLowerCase();
  }

  /**
   * 키워드 길이 반환
   */
  getLength(): number {
    return this.value.length;
  }

  /**
   * 다른 키워드와 동일한지 확인 (대소문자 무시)
   */
  equals(other: Keyword): boolean {
    return this.getNormalized() === other.getNormalized();
  }

  /**
   * 특정 문자열과 일치하는지 확인
   */
  matches(str: string): boolean {
    return this.getNormalized() === str.toLowerCase().trim();
  }

  /**
   * 문자열 표현
   */
  toString(): string {
    return this.value;
  }
}
