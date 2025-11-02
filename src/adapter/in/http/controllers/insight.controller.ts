import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { Auth } from '../decorators/auth.decorator';
import { CreateAnalyticsRequestDto } from '../dto/create-analytics-request.dto';
import {
  BaseResponse,
  CreateAnalyticsResponseData,
  GetTopInterestsResponseData,
  PruneOldInterestsResponseData,
  GetRecommendationsResponseData,
} from 'pai-shared-types';
import { InsightMapper } from '../mapper/insight.mapper';
import { INSIGHT_TOKENS } from 'src/insight.token';
import type { CreateAnalyticsUseCase } from 'src/application/port/in/create-analytics.use-case';
import type { GetTopInterestsUseCase } from 'src/application/port/in/get-top-interests.use-case';
import type { PruneOldInterestsUseCase } from 'src/application/port/in/prune-old-interests.use-case';
import type { GetRecommendationsUseCase } from 'src/application/port/in/get-recommendations.use-case';
import { GetTopInterestsQuery } from 'src/application/command/get-top-interests.command';
import { PruneOldInterestsCommand } from 'src/application/command/prune-old-interests.command';
import { GetRecommendationsQuery } from 'src/application/command/get-recommendations.command';

@UseGuards(BasicAuthGuard)
@Controller('api/insights')
export class InsightController {
  constructor(
    private readonly insightMapper: InsightMapper,

    @Inject(INSIGHT_TOKENS.CreateAnalyticsUseCase)
    private readonly createAnalyticsUseCase: CreateAnalyticsUseCase,

    @Inject(INSIGHT_TOKENS.GetTopInterestsUseCase)
    private readonly getTopInterestsUseCase: GetTopInterestsUseCase,

    @Inject(INSIGHT_TOKENS.PruneOldInterestsUseCase)
    private readonly pruneOldInterestsUseCase: PruneOldInterestsUseCase,

    @Inject(INSIGHT_TOKENS.GetRecommendationsUseCase)
    private readonly getRecommendationsUseCase: GetRecommendationsUseCase,
  ) {}

  @Post('analytics')
  async createAnalytics(
    @Body() dto: CreateAnalyticsRequestDto,
    @Auth('userId') userId: number,
  ): Promise<BaseResponse<CreateAnalyticsResponseData>> {
    const command = this.insightMapper.toCreateCommand(dto, userId);
    const result = await this.createAnalyticsUseCase.execute(command);
    const response = this.insightMapper.toCreateResponse(result);

    return {
      success: true,
      message: 'AI분석 결과 저장 성공',
      data: response,
    };
  }

  @Get('interests/:childId/top')
  async getTopInterests(
    @Param('childId') childId: string,
    @Query('limit') limit?: string,
  ): Promise<BaseResponse<GetTopInterestsResponseData>> {
    const query = new GetTopInterestsQuery(
      Number(childId),
      limit ? Number(limit) : 10,
    );
    const result = await this.getTopInterestsUseCase.execute(query);
    const response = this.insightMapper.toGetTopInterestsResponse(result);

    return {
      success: true,
      message: '상위 관심사 조회 성공',
      data: response,
    };
  }

  @Delete('interests/prune')
  async pruneOldInterests(
    @Query('minDays') minDays?: string,
    @Query('maxScore') maxScore?: string,
  ): Promise<BaseResponse<PruneOldInterestsResponseData>> {
    const command = new PruneOldInterestsCommand(
      minDays ? Number(minDays) : 14,
      maxScore ? Number(maxScore) : 1.0,
    );
    const result = await this.pruneOldInterestsUseCase.execute(command);
    const response = this.insightMapper.toPruneResponse(result);

    return {
      success: true,
      message: '오래된 관심사 정리 성공',
      data: response,
    };
  }

  @Get('recommendations/:childId')
  async getRecommendations(
    @Param('childId') childId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
  ): Promise<BaseResponse<GetRecommendationsResponseData>> {
    const query = new GetRecommendationsQuery(
      Number(childId),
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 10,
      category,
    );
    const result = await this.getRecommendationsUseCase.execute(query);
    const response = this.insightMapper.toRecommendationsResponse(result);

    return {
      success: true,
      message: '추천 콘텐츠 조회 성공',
      data: response,
    };
  }
}
