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
    const childInterest = await this.childInterestQuery.findTopByChildId(
      query.childId,
    );

    if (!childInterest) {
      return null;
    } else {
      const interest: InterestItem = {
        keyword: childInterest.getKeyword(),
        rawScore: childInterest.getRawScore(),
        lastUpdated: childInterest.getLastUpdated(),
      };
      return { interests: interest };
    }
  }
}
