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
import { GetRecommendationsQuery } from 'src/application/command/get-recommendations.command';
import { GetTopInterestsQuery } from 'src/application/command/get-top-interests.command';

@Injectable()
export class InsightMapper {
  toCreateCommand(
    dto: CreateAnalyticsRequestDto,
    userId: number,
  ): CreateAnalyticsCommand {
    return new CreateAnalyticsCommand(
      userId, // userId (토큰의 profileId)
      Number(dto.childId), // childId (DTO에서)
      BigInt(dto.conversationId), // string → bigint
      dto.extractedKeywords,
    );
  }

  toCreateResponse(result: CreateAnalyticsResult): CreateAnalyticsResponseData {
    return {
      title: result.title,
    };
  }

  toGetTopInterestsCommand(
    childId: number,
    limit: number,
  ): GetTopInterestsQuery {
    return new GetTopInterestsQuery(childId, limit);
  }

  toGetTopInterestsResponse(
    result: GetTopInterestsResult,
  ): GetTopInterestsResponseData {
    return {
      interests: result.interests.map((item) => ({
        keyword: item.keyword,
        rawScore: item.rawScore,
        lastUpdated: item.lastUpdated?.toISOString(),
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

  toRecommandationCommand(
    childId: number,
    page: number,
    pageSize: number,
    category?: string,
  ): GetRecommendationsQuery {
    return new GetRecommendationsQuery(childId, page, pageSize, category);
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
