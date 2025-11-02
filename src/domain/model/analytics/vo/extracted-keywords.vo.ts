/**
 * 대화에서 추출된 키워드 목록 (Value Object)
 * - 키워드는 중복되지 않음
 * - 불변 객체
 */
export class ExtractedKeywords {
  private constructor(private readonly keywords: string[]) {
    Object.freeze(this);
  }

  /**
   * 키워드 배열로 VO 생성
   */
  static create(keywords: string[] | null | undefined): ExtractedKeywords {
    if (!keywords || keywords.length === 0) {
      return new ExtractedKeywords([]);
    }

    // 중복 제거 및 정규화
    const normalized = keywords
      .map((k) => k?.trim())
      .filter((k) => k && k.length > 0)
      .filter((k, index, self) => self.indexOf(k) === index); // 중복 제거

    return new ExtractedKeywords(normalized);
  }

  /**
   * JSON 객체에서 생성 (DB에서 로드 시)
   */
  static fromJSON(json: any): ExtractedKeywords {
    if (!json) {
      return new ExtractedKeywords([]);
    }

    // JSON이 배열 형태인 경우
    if (Array.isArray(json)) {
      return ExtractedKeywords.create(json);
    }

    // JSON이 객체 형태인 경우 (예: { keywords: [...] })
    if (typeof json === 'object' && json.keywords) {
      return ExtractedKeywords.create(json.keywords);
    }

    return new ExtractedKeywords([]);
  }

  /**
   * 키워드 목록 반환
   */
  getValue(): string[] {
    return [...this.keywords]; // 복사본 반환 (불변성 유지)
  }

  /**
   * JSON 직렬화 (DB 저장 시)
   */
  toJSON(): string[] {
    return this.keywords;
  }

  /**
   * 키워드 개수
   */
  getCount(): number {
    return this.keywords.length;
  }

  /**
   * 비어있는지 확인
   */
  isEmpty(): boolean {
    return this.keywords.length === 0;
  }

  /**
   * 특정 키워드 포함 여부
   */
  contains(keyword: string): boolean {
    return this.keywords.includes(keyword.trim());
  }

  /**
   * 동등성 비교
   */
  equals(other: ExtractedKeywords): boolean {
    if (!(other instanceof ExtractedKeywords)) {
      return false;
    }

    if (this.keywords.length !== other.keywords.length) {
      return false;
    }

    return this.keywords.every((k) => other.keywords.includes(k));
  }
}
