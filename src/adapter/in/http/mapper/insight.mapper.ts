import { Injectable } from '@nestjs/common';
import { CreateAnalyticsRequestDto } from '../dto/create-analytics-request.dto';
import { CreateAnalyticsCommand } from 'src/application/command/create-analytics.command';
import { CreateAnalyticsResponseData } from 'pai-shared-types';
import { CreateAnalyticsResult } from 'src/application/port/in/result/create-analytics.result.dto';

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
}
