import { Injectable } from '@nestjs/common';

/**
 * KeywordMatchingService
 *
 * 도메인 서비스: 키워드 매칭 로직을 담당
 * - 콘텐츠와 키워드의 연관성 판단
 * - 여러 UseCase에서 재사용 가능
 */
@Injectable()
export class KeywordMatchingService {
  /**
   * 콘텐츠에서 관련 키워드 찾기
   *
   * @param content 검색할 콘텐츠 (제목, 설명, 카테고리 등)
   * @param keywords 매칭할 키워드 목록
   * @returns 매칭된 키워드 목록
   *
   * @example
   * const matched = service.findRelevantKeywords(
   *   { title: '공룡 박물관', description: '티라노사우루스' },
   *   ['공룡', '로봇', '우주']
   * );
   * // 결과: ['공룡']
   */
  findRelevantKeywords(
    content: {
      title?: string;
      description?: string;
      category?: string;
      [key: string]: any;
    },
    keywords: string[],
  ): string[] {
    if (!keywords || keywords.length === 0) {
      return [];
    }

    const relevantKeywords: string[] = [];

    // 검색 대상 텍스트 생성
    const searchText = this.buildSearchText(content);

    // 각 키워드가 포함되어 있는지 확인
    for (const keyword of keywords) {
      if (this.isKeywordMatched(searchText, keyword)) {
        relevantKeywords.push(keyword);
      }
    }

    return relevantKeywords;
  }

  /**
   * 여러 콘텐츠에서 가장 관련성 높은 키워드 찾기
   *
   * @param contents 콘텐츠 목록
   * @param keywords 키워드 목록
   * @returns 각 콘텐츠별 매칭된 키워드 수
   */
  findMostRelevantContent<T extends { title?: string; description?: string }>(
    contents: T[],
    keywords: string[],
  ): Array<T & { matchCount: number; matchedKeywords: string[] }> {
    return contents
      .map((content) => {
        const matchedKeywords = this.findRelevantKeywords(content, keywords);
        return {
          ...content,
          matchCount: matchedKeywords.length,
          matchedKeywords,
        };
      })
      .sort((a, b) => b.matchCount - a.matchCount);
  }

  /**
   * 키워드 매칭 점수 계산
   *
   * @param content 콘텐츠
   * @param keywords 키워드 목록
   * @returns 0~1 사이의 매칭 점수
   */
  calculateMatchScore(
    content: { title?: string; description?: string; category?: string },
    keywords: string[],
  ): number {
    if (!keywords || keywords.length === 0) {
      return 0;
    }

    const matchedKeywords = this.findRelevantKeywords(content, keywords);
    return matchedKeywords.length / keywords.length;
  }

  /**
   * 검색 대상 텍스트 생성 (소문자 변환)
   */
  private buildSearchText(content: {
    title?: string;
    description?: string;
    category?: string;
    [key: string]: any;
  }): string {
    const parts: string[] = [];

    if (content.title) parts.push(content.title);
    if (content.description) parts.push(content.description);
    if (content.category) parts.push(content.category);

    return parts.join(' ').toLowerCase();
  }

  /**
   * 키워드가 텍스트에 포함되어 있는지 확인 (대소문자 무시)
   */
  private isKeywordMatched(searchText: string, keyword: string): boolean {
    const normalizedKeyword = keyword.toLowerCase().trim();
    return searchText.includes(normalizedKeyword);
  }

  /**
   * 정확히 일치하는 키워드 찾기 (단어 경계 고려)
   */
  isExactMatch(text: string, keyword: string): boolean {
    const normalizedText = text.toLowerCase();
    const normalizedKeyword = keyword.toLowerCase().trim();

    // 단어 경계를 고려한 정규식
    const regex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`);
    return regex.test(normalizedText);
  }

  /**
   * 정규식 특수문자 이스케이프
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
