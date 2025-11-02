import { Analytics } from 'src/domain/model/analytics/entity/analytics.entity';
import { AnalyticsRecord } from './analytics.type';
import { ExtractedKeywords } from 'src/domain/model/analytics/vo/extracted-keywords.vo';

export class AnalyticsMapper {
  /**
   * DB 레코드 → 도메인 엔티티
   */
  static toDomain(record: AnalyticsRecord): Analytics {
    // JSON 컬럼을 파싱하여 VO 생성
    const keywordsArray =
      typeof record.extracted_keywords === 'string'
        ? JSON.parse(record.extracted_keywords)
        : record.extracted_keywords;

    const keywordsVO = ExtractedKeywords.fromJSON(keywordsArray);

    return Analytics.rehydrate({
      id: record.analytics_id,
      childId: Number(record.child_id),
      conversationId: record.conversation_id,
      extractedKeywords: keywordsVO,
      createdAt: record.created_at,
    });
  }

  /**
   * 도메인 엔티티 → DB 저장용 객체
   */
  static toPersistence(analytics: Analytics): any {
    return {
      child_id: analytics.getChildId(),
      conversation_id: analytics.getConversationId(),
      // VO의 toJSON() 메서드로 JSON 직렬화
      extracted_keywords: analytics.getExtractedKeywords().toJSON(),
      created_at: analytics.getCreatedAt(),
    };
  }
}
