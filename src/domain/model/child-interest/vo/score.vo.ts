/**
 * Score Value Object
 *
 * 관심사 점수를 나타내는 VO
 * - 불변성 보장
 * - 유효성 검증 (0 이상)
 * - 소수점 정밀도 관리
 */
export class Score {
  private readonly value: number;

  // 상수 정의
  private static readonly MIN_SCORE = 0;
  private static readonly MAX_SCORE = 100;
  private static readonly DECIMAL_PLACES = 2;

  private constructor(score: number) {
    this.value = score;
  }

  /**
   * Score VO 생성
   *
   * @param score 점수 값
   * @returns Score VO
   * @throws Error 유효하지 않은 점수인 경우
   */
  static create(score: number): Score {
    // 유효성 검증
    if (typeof score !== 'number' || isNaN(score)) {
      throw new Error('점수는 숫자여야 합니다.');
    }

    if (!isFinite(score)) {
      throw new Error('점수는 유한한 숫자여야 합니다.');
    }

    if (score < Score.MIN_SCORE) {
      throw new Error(`점수는 ${Score.MIN_SCORE} 이상이어야 합니다.`);
    }

    if (score > Score.MAX_SCORE) {
      throw new Error(`점수는 ${Score.MAX_SCORE} 이하여야 합니다.`);
    }

    // 소수점 정밀도 조정
    const rounded = Score.roundToPrecision(score);

    return new Score(rounded);
  }

  /**
   * 0점 Score 생성 (편의 메서드)
   */
  static zero(): Score {
    return new Score(0);
  }

  /**
   * 점수 값 반환
   */
  getValue(): number {
    return this.value;
  }

  /**
   * 점수가 0인지 확인
   */
  isZero(): boolean {
    return this.value === 0;
  }

  /**
   * 점수가 특정 임계값 이상인지 확인
   */
  isAbove(threshold: number): boolean {
    return this.value > threshold;
  }

  /**
   * 점수가 특정 임계값 이하인지 확인
   */
  isBelow(threshold: number): boolean {
    return this.value < threshold;
  }

  /**
   * 점수 추가 (새로운 Score 반환)
   */
  add(amount: number): Score {
    return Score.create(this.value + amount);
  }

  /**
   * 점수 곱하기 (새로운 Score 반환)
   */
  multiply(factor: number): Score {
    return Score.create(this.value * factor);
  }

  /**
   * 다른 점수와 비교
   */
  compareTo(other: Score): number {
    return this.value - other.value;
  }

  /**
   * 다른 점수와 동일한지 확인
   */
  equals(other: Score): boolean {
    return Math.abs(this.value - other.value) < Number.EPSILON;
  }

  /**
   * 소수점 정밀도 조정
   */
  private static roundToPrecision(value: number): number {
    const multiplier = Math.pow(10, Score.DECIMAL_PLACES);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * 문자열 표현
   */
  toString(): string {
    return this.value.toFixed(Score.DECIMAL_PLACES);
  }

  /**
   * 숫자 표현 (JSON 직렬화용)
   */
  toJSON(): number {
    return this.value;
  }
}
