import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { CreateAnalyticsRequestDto as ICreateAnalyticsRequestDto } from 'pai-shared-types';

/**
 * CreateAnalyticsRequestDto
 * - childId는 토큰의 profileId에서 가져옴 (DTO에서 제거)
 * - conversationId와 extractedKeywords만 요청 Body에 포함
 */
export class CreateAnalyticsRequestDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string; // bigint는 HTTP에서 string으로 전송

  @IsArray()
  @IsString({ each: true })
  extractedKeywords: string[];
}
