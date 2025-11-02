import { ChildInterest } from 'src/domain/model/child-interest/entity/child-interest.entity';

export interface ChildInterestRepositoryPort {
  save(interest: ChildInterest): Promise<ChildInterest>;
  findByChildIdAndKeyword(
    childId: number,
    keyword: string,
  ): Promise<ChildInterest | null>;
  findByChildId(childId: number): Promise<ChildInterest[]>;
  bulkSave(interests: ChildInterest[]): Promise<ChildInterest[]>;
}
