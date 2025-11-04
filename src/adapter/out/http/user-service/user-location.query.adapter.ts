import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  UserLocation,
  UserLocationQueryPort,
} from 'src/application/port/out/user-location.query.port';

/**
 * User Service HTTP Adapter - User 위치 조회
 *
 * 헥사고날 아키텍처:
 * - UserLocationQueryPort를 구현
 * - MSA 환경에서 User Service와 HTTP 통신
 * - Infrastructure Layer (Adapter)
 */
@Injectable()
export class UserLocationQueryAdapter implements UserLocationQueryPort {
  private readonly logger = new Logger(UserLocationQueryAdapter.name);
  private readonly userServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.userServiceUrl =
      this.configService.get<string>('USER_SERVICE_URL') ||
      'http://localhost:3001';
  }

  async findLocationByUserId(userId: number): Promise<UserLocation | null> {
    try {
      this.logger.log(`User Service로 위치 정보 조회 - userId: ${userId}`);

      const url = `${this.userServiceUrl}/api/internal/users/${userId}/location`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.warn(`사용자를 찾을 수 없음 - userId: ${userId}`);
          return null;
        }
        throw new Error(
          `User Service API 호출 실패: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // User Service의 응답 구조에 맞게 매핑
      // 예상 응답: { success: true, data: { userId, latitude, longitude, address } }
      if (data.success && data.data) {
        return {
          userId: data.data.userId,
          latitude: data.data.latitude,
          longitude: data.data.longitude,
          address: data.data.address,
        };
      }

      this.logger.warn(`User Service 응답 형식 오류 - userId: ${userId}`);
      return null;
    } catch (error) {
      this.logger.error(
        `User Service 호출 중 오류 발생 - userId: ${userId}`,
        error,
      );
      // MSA 환경에서 다른 서비스 장애 시에도 전체 기능이 중단되지 않도록 null 반환
      return null;
    }
  }
}
