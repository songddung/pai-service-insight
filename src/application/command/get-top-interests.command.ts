export class GetTopInterestsQuery {
  constructor(
    public readonly childId: number,
    public readonly limit: number = 10,
  ) {}
}
