import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ProfileInfo,
  ProfileQueryPort,
} from 'src/application/port/out/profile.query.port';

/**
 * User Service HTTP Adapter - Profile 조회
 *
 * 헥사고날 아키텍처:
 * - ProfileQueryPort를 구현
 * - MSA 환경에서 User Service와 HTTP 통신
 * - Infrastructure Layer (Adapter)
 */
@Injectable()
export class ProfileQueryAdapter implements ProfileQueryPort {
  private readonly logger = new Logger(ProfileQueryAdapter.name);
  private readonly userServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.userServiceUrl =
      this.configService.get<string>('USER_SERVICE_URL') ||
      'http://localhost:3001';
  }

  async findById(profileId: number): Promise<ProfileInfo | null> {
    try {
      this.logger.log(
        `User Service로 Profile 정보 조회 - profileId: ${profileId}`,
      );

      const url = `${this.userServiceUrl}/api/internal/profiles/${profileId}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.warn(`프로필을 찾을 수 없음 - profileId: ${profileId}`);
          return null;
        }
        throw new Error(
          `User Service API 호출 실패: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // User Service의 응답 구조에 맞게 매핑
      // 예상 응답: { success: true, data: { profileId, userId, name, profileType } }
      if (data.success && data.data) {
        return {
          profileId: data.data.profileId,
          userId: data.data.userId,
          name: data.data.name,
          profileType: data.data.profileType,
        };
      }

      this.logger.warn(`User Service 응답 형식 오류 - profileId: ${profileId}`);
      return null;
    } catch (error) {
      this.logger.error(
        `User Service 호출 중 오류 발생 - profileId: ${profileId}`,
        error,
      );
      // MSA 환경에서 다른 서비스 장애 시에도 전체 기능이 중단되지 않도록 null 반환
      return null;
    }
  }
}
