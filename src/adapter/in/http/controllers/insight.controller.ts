import {
  Body,
  Controller,
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
} from 'pai-shared-types';
import { InsightMapper } from '../mapper/insight.mapper';
import { INSIGHT_TOKENS } from 'src/insight.token';
import type { CreateAnalyticsUseCase } from 'src/application/port/in/create-analytics.use-case';
import type { GetTopInterestsUseCase } from 'src/application/port/in/get-top-interests.use-case';
import { GetTopInterestsQuery } from 'src/application/command/get-top-interests.command';

@UseGuards(BasicAuthGuard)
@Controller('api/insights')
export class InsightController {
  constructor(
    private readonly insightMapper: InsightMapper,

    @Inject(INSIGHT_TOKENS.CreateAnalyticsUseCase)
    private readonly createAnalyticsUseCase: CreateAnalyticsUseCase,

    @Inject(INSIGHT_TOKENS.GetTopInterestsUseCase)
    private readonly getTopInterestsUseCase: GetTopInterestsUseCase,
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
}
