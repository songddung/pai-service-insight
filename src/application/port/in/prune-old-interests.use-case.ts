import { PruneOldInterestsCommand } from 'src/application/command/prune-old-interests.command';
import { PruneOldInterestsResult } from './result/prune-old-interests.result.dto';

export interface PruneOldInterestsUseCase {
  execute(command: PruneOldInterestsCommand): Promise<PruneOldInterestsResult>;
}
