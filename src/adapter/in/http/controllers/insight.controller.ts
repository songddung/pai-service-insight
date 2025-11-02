import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { Auth } from '../decorators/auth.decorator';
import { CreateAnalyticsRequestDto } from '../dto/create-analytics-request.dto';
import { BaseResponse, CreateAnalyticsResponseData } from 'pai-shared-types';
import { InsightMapper } from '../mapper/insight.mapper';
import { INSIGHT_TOKENS } from 'src/insight.token';
import type { CreateAnalyticsUseCase } from 'src/application/port/in/create-analytics.use-case';

@UseGuards(BasicAuthGuard)
@Controller('api/insights')
export class InsightController {
  constructor(
    private readonly insightMapper: InsightMapper,

    @Inject(INSIGHT_TOKENS.CreateAnalyticsUseCase)
    private readonly createAnalyticsUseCase: CreateAnalyticsUseCase,
  ) {}

  @Post('analytics')
  async createAnalytics(
    @Body() dto: CreateAnalyticsRequestDto,
    @Auth('userId') userId,
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
}
