/**
 * Profile 정보 조회 Port (Output Port)
 *
 * 헥사고날 아키텍처:
 * - Application Layer에서 정의
 * - Infrastructure Layer(Adapter)에서 구현
 * - MSA 환경에서 User Service와 통신
 */
export interface ProfileInfo {
  profileId: number;
  userId: number;
  name: string;
  profileType: 'parent' | 'child';
}

export interface ProfileQueryPort {
  /**
   * Profile ID로 Profile 정보 조회
   * @param profileId 프로필 ID
   * @returns 프로필 정보
   */
  findById(profileId: number): Promise<ProfileInfo | null>;
}
