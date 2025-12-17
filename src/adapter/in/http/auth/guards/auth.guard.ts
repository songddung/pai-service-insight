import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyAccessToken, type AuthClaims } from '../token.verifier';
import type { TokenVersionQueryPort } from 'src/application/port/out/token-version.query.port';
import { INSIGHT_TOKENS } from 'src/insight.token';

/**
 * AuthGuard - 프로필 필수 (부모/자녀 둘 다 허용)
 * - userId, profileId, profileType 모두 필수
 * - tokenVersion 검증
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(INSIGHT_TOKENS.TokenVersionQueryPort)
    private readonly tokenVersionQuery: TokenVersionQueryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // HTTP 요청 객체 가져오기
    const req = context.switchToHttp().getRequest();

    // 1) Bearer 토큰 추출
    const authHeader = req.headers['authorization'] as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('UNAUTHORIZED: Bearer token required');
    }
    const token = authHeader.slice('Bearer '.length).trim();

    // 2) 서명/만료 검증 + 클레임 추출
    let claims: AuthClaims;
    try {
      claims = await verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('UNAUTHORIZED: invalid or expired token');
    }

    // 3) 필요한 클레임 확인
    const userId = claims.sub;
    const profileId = claims.profileId;
    const profileType = claims.profileType;
    const deviceId = claims.deviceId;

    if (!userId)
      throw new UnauthorizedException('UNAUTHORIZED: sub(userId) missing');
    if (!profileId)
      throw new BadRequestException('VALIDATION_ERROR: profileId missing');
    if (profileType !== 'parent' && profileType !== 'child') {
      throw new ForbiddenException('FORBIDDEN: invalid profile type');
    }

    // 4) Token Version 검증 (무효화된 토큰 차단)
    const tokenVersion = claims.tokenVersion;
    if (tokenVersion !== undefined) {
      const currentVersion = await this.tokenVersionQuery.getVersion(
        Number(userId),
        String(deviceId),
      );
      if (tokenVersion !== currentVersion) {
        throw new UnauthorizedException(
          'UNAUTHORIZED: token has been revoked (version mismatch)',
        );
      }
    }

    // 5) req.auth에 저장
    req.auth = { token, userId, profileId, profileType, claims };
    return true;
  }
}

/**
 * ParentGuard - 부모 프로필 전용
 * - AuthGuard 검증 + profileType === 'parent' 확인
 */
@Injectable()
export class ParentGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = await super.canActivate(context);
    const req = context.switchToHttp().getRequest();
    if (req.auth.profileType !== 'parent') {
      throw new ForbiddenException('FORBIDDEN: parent profile required');
    }
    return ok;
  }
}

/**
 * ChildGuard - 자녀 프로필 전용
 * - AuthGuard 검증 + profileType === 'child' 확인
 */
@Injectable()
export class ChildGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = await super.canActivate(context);
    const req = context.switchToHttp().getRequest();
    if (req.auth.profileType !== 'child') {
      throw new ForbiddenException('FORBIDDEN: child profile required');
    }
    return ok;
  }
}
