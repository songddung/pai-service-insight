import { ChildInterest } from 'src/domain/model/child-interest/entity/child-interest.entity';

export interface ChildInterestQueryPort {
  /**
   * 자녀의 상위 관심사 조회 (가장 점수가 높은)
   */
  findTopByChildId(childId: number): Promise<ChildInterest | null>;
}
