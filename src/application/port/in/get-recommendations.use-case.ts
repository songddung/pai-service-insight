import { GetRecommendationsQuery } from 'src/application/command/get-recommendations.command';
import { GetRecommendationsResult } from './result/get-recommendations.result.dto';

export interface GetRecommendationsUseCase {
  execute(query: GetRecommendationsQuery): Promise<GetRecommendationsResult>;
}
