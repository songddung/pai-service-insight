import { Inject, Injectable } from '@nestjs/common';
import { GetTopInterestsUseCase } from '../port/in/get-top-interests.use-case';
import { GetTopInterestsQuery } from '../command/get-top-interests.command';
import {
  GetTopInterestsResult,
  InterestItem,
} from '../port/in/result/get-top-interests.result.dto';
import type { ChildInterestQueryPort } from '../port/out/child-interest.query.port';
import { INSIGHT_TOKENS } from 'src/insight.token';

@Injectable()
export class GetTopInterestsService implements GetTopInterestsUseCase {
  constructor(
    @Inject(INSIGHT_TOKENS.ChildInterestQueryPort)
    private readonly childInterestQuery: ChildInterestQueryPort,
  ) {}

  async execute(
    query: GetTopInterestsQuery,
  ): Promise<GetTopInterestsResult | null> {
    const childInterests = await this.childInterestQuery.findTopByChildId(
      query.childId,
      query.limit,
    );

    if (childInterests.length === 0) {
      return null;
    }

    const interests: InterestItem[] = childInterests.map((interest) => ({
      keyword: interest.getKeyword(),
      rawScore: interest.getRawScore(),
      lastUpdated: interest.getLastUpdated(),
    }));

    return { interests };
  }
}
