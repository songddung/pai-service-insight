export const INSIGHT_TOKENS = {
  // UseCase (Input Ports)
  CreateAnalyticsUseCase: Symbol('CreateAnalyticsUseCase'),

  // Repository (Output Ports - Write)
  AnalyticsRepositoryPort: Symbol('AnalyticsRepositoryPort'),
  ChildInterestRepositoryPort: Symbol('ChildInterestRepositoryPort'),

  // Query (Output Ports - Read)
  TokenVersionQueryPort: Symbol('TokenVersionQueryPort'),

  // External Services (Output Ports)
  // Security (Output Ports)
  TokenProvider: Symbol('TokenProvider'),
};
