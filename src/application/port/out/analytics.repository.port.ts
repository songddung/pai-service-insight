import { Analytics } from 'src/domain/model/analytics/entity/analytics.entity';

export interface AnalyticsRepositoryPort {
  save(analytics: Analytics): Promise<Analytics>;
  findById(id: bigint): Promise<Analytics | null>;
  findByChildId(childId: number): Promise<Analytics[]>;
  findByConversationId(conversationId: bigint): Promise<Analytics | null>;
}
