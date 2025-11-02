/*
* 1. 요청 객체에서 인증 정보 추출
*    HTTP 요청(req)에서 auth 객체를 가져옴
*
* 2. 선택적 필드 반환
*   field 파라미터가 없으면 {userId, profileId } 객체 전체 반환 (number 타입으로 변환)
*   field가 userId면 userId만 반환 (number 타입으로 자동 변환)
*   field가 profileId면 profileId만 반환 (number 타입으로 자동 변환)
*
* 3. 자동 타입 변환
*   Controller에서 Number() 변환 없이 바로 number 타입으로 사용 가능
*/

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Auth = createParamDecorator(
    (field: 'userId' | 'profileId' | undefined, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest() as any;
        const { auth } = req;

        if (!field) {
            return auth
                ? {
                      userId: auth.userId ? Number(auth.userId) : undefined,
                      profileId: auth.profileId ? Number(auth.profileId) : undefined,
                  }
                : undefined;
        }

        const value = auth?.[field];
        return value !== undefined && value !== null ? Number(value) : undefined;
    },
);