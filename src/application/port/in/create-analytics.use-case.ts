import { CreateAnalyticsCommand } from 'src/application/command/create-analytics.command';
import { CreateAnalyticsResult } from './result/create-analytics.result.dto';

export interface CreateAnalyticsUseCase {
  execute(command: CreateAnalyticsCommand): Promise<CreateAnalyticsResult>;
}
