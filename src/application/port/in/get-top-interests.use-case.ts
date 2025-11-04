import { GetTopInterestsQuery } from 'src/application/command/get-top-interests.command';
import { GetTopInterestsResult } from './result/get-top-interests.result.dto';

export interface GetTopInterestsUseCase {
  execute(query: GetTopInterestsQuery): Promise<GetTopInterestsResult | null>;
}
