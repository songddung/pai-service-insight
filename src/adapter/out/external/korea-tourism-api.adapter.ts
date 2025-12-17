import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  RecommendationProviderPort,
  RecommendationSearchCriteria,
  RecommendationSearchResult,
} from 'src/application/port/out/recommendation-provider.port';

/**
 * 한국관광공사 Tour API Adapter
 * 축제, 행사, 관광지 정보를 조회하는 실제 외부 API 연동
 *
 * API 문서: https://api.visitkorea.or.kr/#/useKoreaGuide
 * API 엔드포인트: https://apis.data.go.kr/B551011/KorService2
 *
 * 주요 API:
 * - searchKeyword2: 키워드 검색 조회
 * - searchFestival2: 행사 정보 조회
 * - areaBasedList2: 지역기반 관광정보 조회
 */
@Injectable()
export class KoreaTourismApiAdapter implements RecommendationProviderPort {
  private readonly logger = new Logger(KoreaTourismApiAdapter.name);
  private readonly baseUrl = 'https://apis.data.go.kr/B551011/KorService2';
  private readonly serviceKey: string;

  constructor(private readonly configService: ConfigService) {
    this.serviceKey = this.configService.get<string>('KOREA_TOUR_API_KEY', '');
    if (!this.serviceKey) {
      this.logger.warn('한국관광공사 API 키가 설정되지 않았습니다.');
    }
  }

  async searchRecommendations(
    criteria: RecommendationSearchCriteria,
  ): Promise<RecommendationSearchResult> {
    try {
      this.logger.log(`한국관광공사 API 호출 - keyword: ${criteria.keyword}`);

      // 키워드로 검색 (searchKeyword2 API 사용)
      const items = await this.searchByKeyword(criteria.keyword);

      this.logger.log(`키워드 검색 결과 - 총 ${items.length}개`);

      // 카테고리 필터 적용
      const categoryFiltered = criteria.category
        ? items.filter((item) => item.category === criteria.category)
        : items;

      this.logger.log(
        `한국관광공사 API 결과 - 전체: ${categoryFiltered.length}`,
      );

      // 페이지네이션과 거리 계산은 Application Layer에서 처리
      return {
        items: categoryFiltered,
        totalCount: categoryFiltered.length,
      };
    } catch (error) {
      this.logger.error('한국관광공사 API 호출 실패:', error);
      // 에러 발생 시 빈 결과 반환
      return { items: [], totalCount: 0 };
    }
  }

  /**
   * 키워드로 검색 (searchKeyword2 API 사용)
   * API 문서: https://api.visitkorea.or.kr/#/useKoreaGuide
   *
   * @param keyword - 검색할 키워드 (한글은 자동으로 URL 인코딩됨)
   * @param contentTypeId - 관광타입 ID (선택)
   *   12: 관광지, 14: 문화시설, 15: 축제공연행사, 25: 여행코스
   *   28: 레포츠, 32: 숙박, 38: 쇼핑, 39: 음식점
   */
  private async searchByKeyword(
    keyword: string,
    contentTypeId?: string,
  ): Promise<any[]> {
    try {
      // URLSearchParams는 자동으로 인코딩하므로 원본 키워드 사용
      const params: Record<string, string> = {
        serviceKey: this.serviceKey,
        numOfRows: '50',
        pageNo: '1',
        MobileOS: 'ETC',
        MobileApp: 'PAI',
        _type: 'json',
        arrange: 'C', // C=수정일순(최신순)
        keyword: keyword, // URLSearchParams가 자동으로 인코딩
      };

      // contentTypeId가 제공된 경우 추가
      if (contentTypeId) {
        params.contentTypeId = contentTypeId;
      }

      const urlParams = new URLSearchParams(params);
      const url = `${this.baseUrl}/searchKeyword2?${urlParams.toString()}`;

      this.logger.log(`키워드 검색 API 호출 - keyword: "${keyword}"`);
      this.logger.log(`API 요청 URL: ${url}`);
      const response = await fetch(url);
      const data = await response.json();

      // API 응답 로깅
      this.logger.log(
        `API 응답 상태: ${data.response?.header?.resultCode} - ${data.response?.header?.resultMsg}`,
      );

      if (
        !data.response?.body?.items?.item ||
        data.response.header.resultCode !== '0000'
      ) {
        this.logger.warn(
          `키워드 "${keyword}" 검색 결과 없음 - resultCode: ${data.response?.header?.resultCode}, resultMsg: ${data.response?.header?.resultMsg}`,
        );
        return [];
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      return items.map((item: any) => ({
        id: `${item.contenttypeid}-${item.contentid}`,
        title: item.title || '',
        description: item.addr1 || '',
        category: this.mapContentTypeToCategory(item.contenttypeid),
        location: item.addr1 || '',
        startDate: null,
        endDate: null,
        imageUrl: item.firstimage || item.firstimage2 || null,
        link: this.makeDetailLink(item.contentid),
        mapX: item.mapx ? Number(item.mapx) : undefined,
        mapY: item.mapy ? Number(item.mapy) : undefined,
      }));
    } catch (error) {
      this.logger.error(`키워드 "${keyword}" 검색 중 오류:`, error);
      return [];
    }
  }

  /**
   * contentTypeId를 카테고리로 매핑
   */
  private mapContentTypeToCategory(contentTypeId: string): string {
    const typeMap: Record<string, string> = {
      '12': '관광지', // 관광지
      '14': '문화시설', // 문화시설
      '15': '축제', // 축제공연행사
      '25': '여행코스', // 여행코스
      '28': '레포츠', // 레포츠
      '32': '숙박', // 숙박
      '38': '쇼핑', // 쇼핑
      '39': '음식점', // 음식점
    };
    return typeMap[contentTypeId] || '관광지';
  }

  /**
   * 축제/행사 정보 조회
   */
  private async searchFestivals(
    _criteria: RecommendationSearchCriteria,
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        numOfRows: '100',
        pageNo: '1',
        MobileOS: 'ETC',
        MobileApp: 'PAI',
        _type: 'json',
        arrange: 'A',
        eventStartDate: this.getToday(),
      });
      const url = `${this.baseUrl}/searchFestival2?serviceKey=${this.serviceKey}&${params}`;

      this.logger.debug(`축제 API 호출 URL: ${url.substring(0, 100)}...`);
      const response = await fetch(url);
      const responseText = await response.text();
      this.logger.debug(
        `축제 API 응답 (상태: ${response.status}): ${responseText.substring(0, 200)}`,
      );

      const data = JSON.parse(responseText);

      if (
        !data.response?.body?.items?.item ||
        data.response.header.resultCode !== '0000'
      ) {
        this.logger.warn('축제 정보 조회 실패:', data.response?.header);
        return [];
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      return items.map((item: any) => ({
        id: `festival-${item.contentid}`,
        title: item.title || '',
        description: item.addr1 || '',
        category: '축제',
        location: item.addr1 || '',
        startDate: this.formatDate(item.eventstartdate),
        endDate: this.formatDate(item.eventenddate),
        imageUrl: item.firstimage || item.firstimage2 || null,
        link: this.makeDetailLink(item.contentid),
        mapX: item.mapx ? Number(item.mapx) : undefined,
        mapY: item.mapy ? Number(item.mapy) : undefined,
      }));
    } catch (error) {
      this.logger.error('축제 정보 조회 중 오류:', error);
      return [];
    }
  }

  /**
   * 관광지 정보 조회
   */
  private async searchAttractions(
    _criteria: RecommendationSearchCriteria,
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        numOfRows: '50',
        pageNo: '1',
        MobileOS: 'ETC',
        MobileApp: 'PAI',
        _type: 'json',
        arrange: 'A',
        contentTypeId: '12',
      });
      const url = `${this.baseUrl}/areaBasedList2?serviceKey=${this.serviceKey}&${params}`;

      const response = await fetch(url);
      const data = await response.json();

      if (
        !data.response?.body?.items?.item ||
        data.response.header.resultCode !== '0000'
      ) {
        return [];
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      return items.map((item: any) => ({
        id: `attraction-${item.contentid}`,
        title: item.title || '',
        description: item.addr1 || '',
        category: '관광지',
        location: item.addr1 || '',
        startDate: null,
        endDate: null,
        imageUrl: item.firstimage || item.firstimage2 || null,
        link: this.makeDetailLink(item.contentid),
        mapX: item.mapx ? Number(item.mapx) : undefined,
        mapY: item.mapy ? Number(item.mapy) : undefined,
      }));
    } catch (error) {
      this.logger.error('관광지 정보 조회 중 오류:', error);
      return [];
    }
  }

  /**
   * 문화시설 정보 조회 (박물관, 미술관 등)
   */
  private async searchCultureFacilities(
    _criteria: RecommendationSearchCriteria,
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        numOfRows: '50',
        pageNo: '1',
        MobileOS: 'ETC',
        MobileApp: 'PAI',
        _type: 'json',
        arrange: 'A',
        contentTypeId: '14',
      });
      const url = `${this.baseUrl}/areaBasedList2?serviceKey=${this.serviceKey}&${params}`;

      const response = await fetch(url);
      const data = await response.json();

      if (
        !data.response?.body?.items?.item ||
        data.response.header.resultCode !== '0000'
      ) {
        return [];
      }

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      return items.map((item: any) => ({
        id: `culture-${item.contentid}`,
        title: item.title || '',
        description: item.addr1 || '',
        category: '문화시설',
        location: item.addr1 || '',
        startDate: null,
        endDate: null,
        imageUrl: item.firstimage || item.firstimage2 || null,
        link: this.makeDetailLink(item.contentid),
        mapX: item.mapx ? Number(item.mapx) : undefined,
        mapY: item.mapy ? Number(item.mapy) : undefined,
      }));
    } catch (error) {
      this.logger.error('문화시설 정보 조회 중 오류:', error);
      return [];
    }
  }

  /**
   * 오늘 날짜 (YYYYMMDD)
   */
  private getToday(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * 날짜 포맷 변환 (YYYYMMDD → YYYY-MM-DD)
   */
  private formatDate(dateStr: string): string | null {
    if (!dateStr || dateStr.length !== 8) return null;
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }

  /**
   * 상세 정보 링크 생성
   */
  private makeDetailLink(contentId: string): string {
    return `https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=${contentId}`;
  }
}
