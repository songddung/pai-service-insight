import { ChildInterest } from 'src/domain/model/child-interest/entity/child-interest.entity';
import { ChildInterestRecord } from './child-interest.type';

export class ChildInterestMapper {
  /**
   * DB 레코드 → 도메인 엔티티
   */
  static toDomain(record: ChildInterestRecord): ChildInterest {
    return ChildInterest.rehydrate({
      id: record.interest_id,
      childId: Number(record.child_id),
      keyword: record.keyword,
      rawScore: Number(record.raw_score),
      lastUpdated: record.last_updated,
      createdAt: record.created_at,
    });
  }

  /**
   * 도메인 엔티티 → DB 저장용 객체
   */
  static toPersistence(interest: ChildInterest): any {
    return {
      child_id: interest.getChildId(),
      keyword: interest.getKeyword(),
      raw_score: interest.getRawScore(),
      last_updated: interest.getLastUpdated(),
      created_at: interest.getCreatedAt(),
    };
  }
}
