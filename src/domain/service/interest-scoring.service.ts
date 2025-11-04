import { Injectable } from '@nestjs/common';

/**
 * InterestScoringService
 *
 * 도메인 서비스: 아이의 관심사 점수 계산 및 감쇠 로직을 담당
 * - 점수 계산은 비즈니스 규칙이므로 도메인 레이어에 위치
 * - 여러 UseCase에서 재사용 가능
 */
@Injectable()
export class InterestScoringService {
  // 기본 점수 (키워드가 한 번 언급될 때)
  private readonly BASE_SCORE = 3.0;

  // 추가 언급 시 보너스 점수 (최대치)
  private readonly MENTION_BONUS_MAX = 3.0;

  // 언급당 보너스 점수
  private readonly MENTION_BONUS_PER_COUNT = 0.5;

  // 점수 반감기 (일 단위)
  private readonly HALF_LIFE_DAYS = 7;

  /**
   * 키워드의 언급 횟수를 기반으로 점수 계산
   *
   * @param mentionCount 키워드가 언급된 횟수
   * @returns 계산된 점수
   *
   * @example
   * - 1회 언급: 3.0 + (1 * 0.5) = 3.5
   * - 2회 언급: 3.0 + (2 * 0.5) = 4.0
   * - 6회 이상 언급: 3.0 + 3.0 = 6.0 (최대)
   */
  calculateScore(mentionCount: number): number {
    if (mentionCount < 0) {
      throw new Error('언급 횟수는 0 이상이어야 합니다.');
    }

    const mentionBonus = Math.min(
      mentionCount * this.MENTION_BONUS_PER_COUNT,
      this.MENTION_BONUS_MAX,
    );

    return this.BASE_SCORE + mentionBonus;
  }

  /**
   * 시간 경과에 따른 점수 감쇠 적용
   *
   * 지수 감쇠 공식 사용:
   * new_score = current_score * (0.5 ^ (days_passed / half_life))
   *
   * @param currentScore 현재 점수
   * @param lastUpdated 마지막 업데이트 시간
   * @returns 감쇠가 적용된 점수
   *
   * @example
   * - 7일 경과: 점수 50% 감소
   * - 14일 경과: 점수 75% 감소
   * - 21일 경과: 점수 87.5% 감소
   */
  applyDecay(currentScore: number, lastUpdated: Date): number {
    if (currentScore < 0) {
      throw new Error('현재 점수는 0 이상이어야 합니다.');
    }

    const now = new Date();
    const daysPassed =
      (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

    // 음수 시간 차이 방지 (미래 날짜)
    if (daysPassed < 0) {
      throw new Error('마지막 업데이트 시간이 미래일 수 없습니다.');
    }

    const decayFactor = Math.pow(0.5, daysPassed / this.HALF_LIFE_DAYS);
    return currentScore * decayFactor;
  }

  /**
   * 기존 관심사 점수를 업데이트
   *
   * 1. 현재 점수에 감쇠 적용
   * 2. 새로운 언급에 대한 점수 추가
   *
   * @param currentScore 현재 점수
   * @param lastUpdated 마지막 업데이트 시간
   * @param newMentionCount 새로운 언급 횟수
   * @returns 업데이트된 점수
   */
  updateExistingScore(
    currentScore: number,
    lastUpdated: Date,
    newMentionCount: number,
  ): number {
    const decayedScore = this.applyDecay(currentScore, lastUpdated);
    const additionalScore = this.calculateScore(newMentionCount);
    return decayedScore + additionalScore;
  }

  /**
   * 점수가 유의미한지 확인 (임계값 이상)
   *
   * @param score 확인할 점수
   * @param threshold 임계값 (기본값: BASE_SCORE)
   * @returns 유의미한 점수인지 여부
   */
  isSignificantScore(score: number, threshold?: number): boolean {
    return score >= (threshold ?? this.BASE_SCORE);
  }
}
