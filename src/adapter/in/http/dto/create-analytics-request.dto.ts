import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { CreateAnalyticsRequestDto as ICreateAnalyticsRequestDto } from 'pai-shared-types';
export class CreateAnalyticsRequestDto implements ICreateAnalyticsRequestDto {
  @IsString()
  @IsNotEmpty()
  childId: string; // bigint는 HTTP에서 string으로 전송

  @IsString()
  @IsNotEmpty()
  conversationId: string; // bigint는 HTTP에서 string으로 전송

  @IsArray()
  @IsString({ each: true })
  extractedKeywords: string[];
}
