import { ChildInterest } from 'src/domain/model/child-interest/entity/child-interest.entity';

export interface ChildInterestQueryPort {
  /**
   * 자녀의 상위 N개 관심사 조회 (점수 높은 순)
   */
  findTopByChildId(childId: number, limit: number): Promise<ChildInterest[]>;
}
