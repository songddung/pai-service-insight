export class CreateAnalyticsCommand {
  constructor(
    public readonly userId: number,
    public readonly childId: number,
    public readonly conversationId: bigint,
    public readonly extractedKeywords: string[], // 키워드 배열
  ) {}
}
