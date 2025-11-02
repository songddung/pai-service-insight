import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { PruneOldInterestsUseCase } from 'src/application/port/in/prune-old-interests.use-case';
import { PruneOldInterestsCommand } from 'src/application/command/prune-old-interests.command';
import { INSIGHT_TOKENS } from 'src/insight.token';

@Injectable()
export class PruneInterestsScheduler {
  private readonly logger = new Logger(PruneInterestsScheduler.name);

  constructor(
    @Inject(INSIGHT_TOKENS.PruneOldInterestsUseCase)
    private readonly pruneOldInterestsUseCase: PruneOldInterestsUseCase,
  ) {}

  // 매일 새벽 3시에 실행
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handlePruneOldInterests() {
    this.logger.log('스케줄러: 오래된 관심사 정리 작업 시작');

    try {
      // 기본값: 14일 이상 업데이트 안됨 & 1.0점 미만
      const command = new PruneOldInterestsCommand(14, 1.0);
      const result = await this.pruneOldInterestsUseCase.execute(command);

      this.logger.log(
        `스케줄러: 오래된 관심사 정리 완료 - 삭제된 개수: ${result.deletedCount}`,
      );
    } catch (error) {
      this.logger.error('스케줄러: 오래된 관심사 정리 중 오류 발생', error);
    }
  }
}
