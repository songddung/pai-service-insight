import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { CreateAnalyticsUseCase } from '../port/in/create-analytics.use-case';
import { INSIGHT_TOKENS } from 'src/insight.token';
import { CreateAnalyticsCommand } from '../command/create-analytics.command';
import { CreateAnalyticsResult } from '../port/in/result/create-analytics.result.dto';
import type { AnalyticsRepositoryPort } from '../port/out/analytics.repository.port';
import type { ChildInterestRepositoryPort } from '../port/out/child-interest.repository.port';
import { Analytics } from 'src/domain/model/analytics/entity/analytics.entity';
import { ChildInterest } from 'src/domain/model/child-interest/entity/child-interest.entity';
import { ExtractedKeywords } from 'src/domain/model/analytics/vo/extracted-keywords.vo';

@Injectable()
export class CreateAnalyticsService implements CreateAnalyticsUseCase {
  constructor(
    @Inject(INSIGHT_TOKENS.AnalyticsRepositoryPort)
    private readonly analyticsRepository: AnalyticsRepositoryPort,

    @Inject(INSIGHT_TOKENS.ChildInterestRepositoryPort)
    private readonly childInterestRepository: ChildInterestRepositoryPort,
  ) {}

  async execute(
    command: CreateAnalyticsCommand,
  ): Promise<CreateAnalyticsResult> {
    // 입력 검증
    if (!command.childId) {
      throw new BadRequestException('아이 ID는 필수입니다.');
    }

    if (!command.conversationId) {
      throw new BadRequestException('대화 ID는 필수입니다.');
    }

    const rawKeywords = command.extractedKeywords || [];
    const keywordFrequency = new Map<string, number>();
    for (const keyword of rawKeywords) {
      const trimmed = keyword?.trim();
      if (trimmed && trimmed.length > 0) {
        const count = keywordFrequency.get(trimmed) || 0;
        keywordFrequency.set(trimmed, count + 1);
      }
    }

    // Value Object 생성 (중복 제거됨)
    const keywordsVO = ExtractedKeywords.create(command.extractedKeywords);

    // Analytics 엔티티 생성 및 저장
    const analytics = Analytics.create({
      childId: command.childId,
      conversationId: command.conversationId,
      extractedKeywords: keywordsVO,
    });

    await this.analyticsRepository.save(analytics);

    // child_interests 업데이트
    const updatedKeywords: string[] = [];
    const createdKeywords: string[] = [];

    // 중복 제거된 키워드만 처리
    const uniqueKeywords = Array.from(keywordFrequency.keys());

    for (const keyword of uniqueKeywords) {
      const mentionCount = keywordFrequency.get(keyword)!;
      const calculatedScore = this.calculateScore(mentionCount);

      // 기존 관심사 찾기
      const existing =
        await this.childInterestRepository.findByChildIdAndKeyword(
          command.childId,
          keyword,
        );

      if (existing) {
        // 기존 키워드: 감쇠 적용 후 새 점수 추가
        const decayedScore = this.applyDecay(
          existing.getRawScore(),
          existing.getLastUpdated() || existing.getCreatedAt()!,
        );
        const newTotalScore = decayedScore + calculatedScore;

        existing.updateScore(newTotalScore);
        await this.childInterestRepository.save(existing);
        updatedKeywords.push(keyword);
      } else {
        // 새 키워드: 계산된 점수로 생성
        const newInterest = ChildInterest.create({
          childId: command.childId,
          keyword: keyword,
          rawScore: calculatedScore,
        });
        await this.childInterestRepository.save(newInterest);
        createdKeywords.push(keyword);
      }
    }

    // 결과 반환
    return {
      updatedKeywords,
      createdKeywords,
    };
  }

  /**
   * 키워드 점수 계산
   * @param mentionCount 언급 횟수
   * @returns 계산된 점수
   */
  private calculateScore(mentionCount: number): number {
    const baseScore = 3.0;
    const mentionBonus = Math.min(mentionCount * 0.5, 3.0); // 최대 3점
    return baseScore + mentionBonus;
  }

  /**
   * 시간에 따른 점수 감쇠 적용
   * @param currentScore 현재 점수
   * @param lastUpdated 마지막 업데이트 시간
   * @returns 감쇠 적용된 점수
   */
  private applyDecay(currentScore: number, lastUpdated: Date): number {
    const now = new Date();
    const daysPassed =
      (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    const halfLife = 7; // 7일 반감기
    const decayFactor = Math.pow(0.5, daysPassed / halfLife);
    return currentScore * decayFactor;
  }
}
