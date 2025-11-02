import { Injectable } from '@nestjs/common';
import { CreateAnalyticsRequestDto } from '../dto/create-analytics-request.dto';
import { CreateAnalyticsCommand } from 'src/application/command/create-analytics.command';
import {
  CreateAnalyticsResponseData,
  GetTopInterestsResponseData,
} from 'pai-shared-types';
import { CreateAnalyticsResult } from 'src/application/port/in/result/create-analytics.result.dto';
import { GetTopInterestsResult } from 'src/application/port/in/result/get-top-interests.result.dto';

@Injectable()
export class InsightMapper {
  toCreateCommand(
    dto: CreateAnalyticsRequestDto,
    userId: number,
  ): CreateAnalyticsCommand {
    return new CreateAnalyticsCommand(
      userId,
      Number(dto.childId), // string → number
      BigInt(dto.conversationId), // string → bigint
      dto.extractedKeywords,
    );
  }

  toCreateResponse(result: CreateAnalyticsResult): CreateAnalyticsResponseData {
    return {
      updatedKeywords: result.updatedKeywords,
      createdKeywords: result.createdKeywords,
    };
  }

  toGetTopInterestsResponse(
    result: GetTopInterestsResult,
  ): GetTopInterestsResponseData {
    return {
      interests: result.interests.map((interest) => ({
        keyword: interest.keyword,
        rawScore: interest.rawScore,
        lastUpdated: interest.lastUpdated.toISOString(),
      })),
    };
  }
}
