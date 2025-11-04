/**
 * User 위치 정보 조회 Port (Output Port)
 *
 * 헥사고날 아키텍처:
 * - Application Layer에서 정의
 * - Infrastructure Layer(Adapter)에서 구현
 * - MSA 환경에서 User Service와 통신
 */
export interface UserLocation {
  userId: number;
  latitude: number;
  longitude: number;
  address: string;
}

export interface UserLocationQueryPort {
  /**
   * Profile의 userId를 통해 User의 위치 정보를 조회
   * @param userId 사용자 ID
   * @returns 사용자 위치 정보
   */
  findLocationByUserId(userId: number): Promise<UserLocation | null>;
}
