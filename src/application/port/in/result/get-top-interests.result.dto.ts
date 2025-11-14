export interface InterestItem {
  keyword: string;
  rawScore: number;
  lastUpdated: Date;
}

export interface GetTopInterestsResult {
  interests: InterestItem[];
}
