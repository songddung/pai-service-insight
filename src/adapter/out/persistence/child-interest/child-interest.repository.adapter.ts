import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChildInterestRepositoryPort } from 'src/application/port/out/child-interest.repository.port';
import { ChildInterest } from 'src/domain/model/child-interest/entity/child-interest.entity';
import { ChildInterestMapper } from './child-interest.mapper';

@Injectable()
export class ChildInterestRepositoryAdapter
  implements ChildInterestRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async save(interest: ChildInterest): Promise<ChildInterest> {
    const data = ChildInterestMapper.toPersistence(interest);

    // ID가 있으면 업데이트, 없으면 생성
    if (interest.getId()) {
      const updated = await this.prisma.childInterest.update({
        where: { interest_id: interest.getId()! },
        data,
      });
      return ChildInterestMapper.toDomain(updated);
    } else {
      const created = await this.prisma.childInterest.create({
        data,
      });
      return ChildInterestMapper.toDomain(created);
    }
  }

  async findByChildIdAndKeyword(
    childId: number,
    keyword: string,
  ): Promise<ChildInterest | null> {
    const record = await this.prisma.childInterest.findFirst({
      where: {
        child_id: childId,
        keyword: keyword,
      },
    });

    return record ? ChildInterestMapper.toDomain(record) : null;
  }

  async findByChildId(childId: number): Promise<ChildInterest[]> {
    const records = await this.prisma.childInterest.findMany({
      where: { child_id: childId },
      orderBy: { raw_score: 'desc' },
    });

    return records.map((record) => ChildInterestMapper.toDomain(record));
  }

  async bulkSave(interests: ChildInterest[]): Promise<ChildInterest[]> {
    if (interests.length === 0) {
      return [];
    }

    const results: ChildInterest[] = [];

    // 생성할 항목과 업데이트할 항목 분리
    const toCreate = interests.filter((interest) => !interest.getId());
    const toUpdate = interests.filter((interest) => interest.getId());

    // 트랜잭션으로 처리
    await this.prisma.$transaction(async (tx) => {
      // 1. 새로운 항목 일괄 생성
      if (toCreate.length > 0) {
        const createData = toCreate.map((interest) =>
          ChildInterestMapper.toPersistence(interest),
        );

        // createMany는 생성된 레코드를 반환하지 않으므로 개별 create 사용
        for (const data of createData) {
          const created = await tx.childInterest.create({ data });
          results.push(ChildInterestMapper.toDomain(created));
        }
      }

      // 2. 기존 항목 일괄 업데이트
      // Prisma는 updateMany로 다른 값을 업데이트할 수 없으므로 개별 업데이트 필요
      for (const interest of toUpdate) {
        const data = ChildInterestMapper.toPersistence(interest);
        const updated = await tx.childInterest.update({
          where: { interest_id: interest.getId()! },
          data,
        });
        results.push(ChildInterestMapper.toDomain(updated));
      }
    });

    return results;
  }

  async deleteOldInterests(
    minDaysSinceUpdate: number,
    maxScore: number,
  ): Promise<{ deletedCount: number; deletedKeywords: string[] }> {
    // 삭제 기준 날짜 계산
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - minDaysSinceUpdate);

    // 삭제 대상 조회 (키워드 수집용)
    const toDelete = await this.prisma.childInterest.findMany({
      where: {
        last_updated: { lt: cutoffDate },
        raw_score: { lt: maxScore },
      },
      select: { keyword: true },
    });

    const deletedKeywords = toDelete.map((item) => item.keyword);

    // 삭제 실행
    const result = await this.prisma.childInterest.deleteMany({
      where: {
        last_updated: { lt: cutoffDate },
        raw_score: { lt: maxScore },
      },
    });

    return {
      deletedCount: result.count,
      deletedKeywords,
    };
  }
}
