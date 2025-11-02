import { Inject, Injectable, Logger } from '@nestjs/common';
import { PruneOldInterestsUseCase } from '../port/in/prune-old-interests.use-case';
import { PruneOldInterestsCommand } from '../command/prune-old-interests.command';
import { PruneOldInterestsResult } from '../port/in/result/prune-old-interests.result.dto';
import type { ChildInterestRepositoryPort } from '../port/out/child-interest.repository.port';
import { INSIGHT_TOKENS } from 'src/insight.token';

@Injectable()
export class PruneOldInterestsService implements PruneOldInterestsUseCase {
  private readonly logger = new Logger(PruneOldInterestsService.name);

  constructor(
    @Inject(INSIGHT_TOKENS.ChildInterestRepositoryPort)
    private readonly childInterestRepository: ChildInterestRepositoryPort,
  ) {}

  async execute(
    command: PruneOldInterestsCommand,
  ): Promise<PruneOldInterestsResult> {
    this.logger.log(
      `오래된 관심사 정리 시작 - minDays: ${command.minDaysSinceUpdate}, maxScore: ${command.maxScore}`,
    );

    // Repository를 통해 오래된 관심사 삭제
    const { deletedCount, deletedKeywords } =
      await this.childInterestRepository.deleteOldInterests(
        command.minDaysSinceUpdate,
        command.maxScore,
      );

    this.logger.log(
      `오래된 관심사 정리 완료 - 삭제된 개수: ${deletedCount}, 삭제된 키워드: ${deletedKeywords.join(', ')}`,
    );

    return { deletedCount, deletedKeywords };
  }
}
