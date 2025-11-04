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
 * API 문서: https://apis.data.go.kr/B551011/KorService1
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
      this.logger.log(`한국관광공사 API 호출 - keywords ${criteria.keyword}`);

      // 1. 축제/행사 정보 조회
      const festivalItems = await this.searchFestivals(criteria);

      // 2. 관광지 정보 조회
      const attractionItems = await this.searchAttractions(criteria);

      // 3. 문화시설 정보 조회
      const cultureItems = await this.searchCultureFacilities(criteria);

      // 4. 모든 결과 병합
      const allItems = [...festivalItems, ...attractionItems, ...cultureItems];
      this.logger.log(
        `API 호출 결과 - 축제: ${festivalItems.length}, 관광지: ${attractionItems.length}, 문화시설: ${cultureItems.length}, 합계: ${allItems.length}`,
      );

      // 5. 키워드 매칭 필터링
      const filtered = this.filterByKeywords(allItems, criteria.keyword);
      this.logger.log(
        `키워드 필터링 후 - ${filtered.length}개 (필터 전: ${allItems.length}개)`,
      );

      // 6. 카테고리 필터 적용
      const categoryFiltered = criteria.category
        ? filtered.filter((item) => item.category === criteria.category)
        : filtered;

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
   * 축제/행사 정보 조회
   */
  private async searchFestivals(
    criteria: RecommendationSearchCriteria,
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
    criteria: RecommendationSearchCriteria,
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
    criteria: RecommendationSearchCriteria,
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
   * 키워드로 필터링
   */
  private filterByKeywords(items: any[], keyword: string): any[] {
    const normalizedKeyword = keyword.toLowerCase().trim();

    if (!normalizedKeyword) {
      return items; // 키워드가 없으면 필터링하지 않음
    }

    return items.filter((item) => {
      const searchText =
        `${item.title} ${item.description} ${item.location}`.toLowerCase();
      // searchText에 최상위 키워드가 포함되어 있는지 확인 후 포함된 것들로 새로운 배열 만들기
      return searchText.includes(normalizedKeyword);
    });
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
