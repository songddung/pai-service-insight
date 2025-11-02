import { Injectable } from '@nestjs/common';
import { CreateAnalyticsRequestDto } from '../dto/create-analytics-request.dto';
import { CreateAnalyticsCommand } from 'src/application/command/create-analytics.command';
import {
  CreateAnalyticsResponseData,
  GetTopInterestsResponseData,
  PruneOldInterestsResponseData,
  GetRecommendationsResponseData,
} from 'pai-shared-types';
import { CreateAnalyticsResult } from 'src/application/port/in/result/create-analytics.result.dto';
import { GetTopInterestsResult } from 'src/application/port/in/result/get-top-interests.result.dto';
import { PruneOldInterestsResult } from 'src/application/port/in/result/prune-old-interests.result.dto';
import { GetRecommendationsResult } from 'src/application/port/in/result/get-recommendations.result.dto';

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

  toPruneResponse(
    result: PruneOldInterestsResult,
  ): PruneOldInterestsResponseData {
    return {
      deletedCount: result.deletedCount,
      deletedKeywords: result.deletedKeywords,
    };
  }

  toRecommendationsResponse(
    result: GetRecommendationsResult,
  ): GetRecommendationsResponseData {
    return {
      recommendations: result.recommendations.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        startDate: item.startDate,
        endDate: item.endDate,
        imageUrl: item.imageUrl,
        link: item.link,
        relevantKeywords: item.relevantKeywords,
      })),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      hasMore: result.hasMore,
    };
  }
}
