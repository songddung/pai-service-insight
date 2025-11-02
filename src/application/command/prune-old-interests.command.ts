export class PruneOldInterestsCommand {
  constructor(
    public readonly minDaysSinceUpdate: number = 14, // 기본값: 14일
    public readonly maxScore: number = 1.0, // 기본값: 1.0점
  ) {}
}
