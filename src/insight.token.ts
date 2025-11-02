export const INSIGHT_TOKENS = {
  // UseCase (Input Ports)
  CreateAnalyticsUseCase: Symbol('CreateAnalyticsUseCase'),
  GetTopInterestsUseCase: Symbol('GetTopInterestsUseCase'),
  PruneOldInterestsUseCase: Symbol('PruneOldInterestsUseCase'),
  GetRecommendationsUseCase: Symbol('GetRecommendationsUseCase'),

  // Repository (Output Ports - Write)
  AnalyticsRepositoryPort: Symbol('AnalyticsRepositoryPort'),
  ChildInterestRepositoryPort: Symbol('ChildInterestRepositoryPort'),

  // Query (Output Ports - Read)
  TokenVersionQueryPort: Symbol('TokenVersionQueryPort'),
  ChildInterestQueryPort: Symbol('ChildInterestQueryPort'),

  // External Services (Output Ports)
  RecommendationProviderPort: Symbol('RecommendationProviderPort'),

  // Security (Output Ports)
  TokenProvider: Symbol('TokenProvider'),
};
