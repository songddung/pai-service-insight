import { Injectable } from '@nestjs/common';

export interface LocationPoint {
  latitude: number;
  longitude: number;
}

export interface ItemWithLocation {
  mapX?: number; // 경도
  mapY?: number; // 위도
  [key: string]: any;
}

export interface ItemWithDistance extends ItemWithLocation {
  distance?: number;
}

@Injectable()
export class LocationDistanceService {
  /**
   * 두 지점 간의 거리를 계산합니다 (Haversine 공식)
   *
   * @param point1 출발점 (사용자 위치)
   * @param point2 도착점 (관광지 위치)
   * @returns 거리 (km)
   */
  calculateDistance(point1: LocationPoint, point2: LocationPoint): number {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.degToRad(point2.latitude - point1.latitude);
    const dLon = this.degToRad(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(point1.latitude)) *
        Math.cos(this.degToRad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // 소수점 첫째자리까지 반올림
  }

  /**
   * 아이템 목록에 거리를 계산하여 추가하고 거리순으로 정렬합니다
   *
   * @param items 아이템 목록
   * @param userLocation 사용자 위치
   * @returns 거리가 추가되고 정렬된 아이템 목록
   */
  addDistanceAndSort<T extends ItemWithLocation>(
    items: T[],
    userLocation: LocationPoint,
  ): ItemWithDistance[] {
    // 각 항목에 거리 계산 추가
    const itemsWithDistance = items.map((item) => {
      if (item.mapX && item.mapY) {
        const distance = this.calculateDistance(userLocation, {
          latitude: item.mapY,
          longitude: item.mapX,
        });
        return { ...item, distance };
      }
      // 위치 정보가 없는 항목은 거리를 무한대로 설정 (뒤로 정렬)
      return { ...item, distance: Infinity };
    });

    // 거리 기준 오름차순 정렬 (가까운 순)
    return itemsWithDistance.sort((a, b) => {
      const distA = a.distance ?? Infinity;
      const distB = b.distance ?? Infinity;
      return distA - distB;
    });
  }

  /**
   * 특정 반경 내의 아이템만 필터링합니다
   *
   * @param items 거리가 계산된 아이템 목록
   * @param radiusKm 반경 (km)
   * @returns 반경 내의 아이템만 포함된 목록
   */
  filterByRadius<T extends ItemWithDistance>(
    items: T[],
    radiusKm: number,
  ): T[] {
    return items.filter(
      (item) => item.distance !== undefined && item.distance <= radiusKm,
    );
  }

  /**
   * 도(degree)를 라디안(radian)으로 변환
   */
  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
