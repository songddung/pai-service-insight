import { CanActivate, ExecutionContext, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { verifyAccessToken } from '../token.verifier';
import type { TokenVersionQueryPort } from 'src/application/port/out/token-version.query.port';
import { INSIGHT_TOKENS } from 'src/insight.token';

/**
 * Basic 토큰 검증 Guard
 * - userId만 포함된 토큰 검증 (회원가입, 프로필 생성 등)
 * - profileId가 없어도 통과
 * - tokenVersion 검증 (무효화된 토큰 차단)
 */
@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(
    @Inject(INSIGHT_TOKENS.TokenVersionQueryPort)
    private readonly tokenVersionQuery: TokenVersionQueryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as any;

    // 1) Bearer 토큰 추출
    const authHeader = req.headers['authorization'] as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('UNAUTHORIZED: Bearer token required');
    }
    const token = authHeader.slice('Bearer '.length).trim();

    // 2) 서명/만료 검증 + 클레임 추출
    let claims;
    try {
      claims = await verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('UNAUTHORIZED: invalid or expired token');
    }

    // 3) userId만 확인 (profileId 없어도 OK)
    const userId = claims.sub;
    if (!userId) {
      throw new UnauthorizedException('UNAUTHORIZED: sub(userId) missing');
    }

    // 4) Token Version 검증 (무효화된 토큰 차단)
    const tokenVersion = claims.tokenVersion;
    if (tokenVersion !== undefined) {
      const currentVersion = await this.tokenVersionQuery.getVersion(
        Number(userId),
      );
      if (tokenVersion !== currentVersion) {
        throw new UnauthorizedException(
          'UNAUTHORIZED: token has been revoked (version mismatch)',
        );
      }
    }

    // 5) req.auth에 저장
    req.auth = {
      token,
      userId,
      profileId: claims.profileId || null,
      profileType: claims.profileType || null,
      claims,
    };

    return true;
  }
}
