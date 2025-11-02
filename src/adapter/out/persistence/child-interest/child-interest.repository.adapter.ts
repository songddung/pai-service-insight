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
    const results: ChildInterest[] = [];

    // 트랜잭션으로 처리
    await this.prisma.$transaction(async (tx) => {
      for (const interest of interests) {
        const data = ChildInterestMapper.toPersistence(interest);

        if (interest.getId()) {
          const updated = await tx.childInterest.update({
            where: { interest_id: interest.getId()! },
            data,
          });
          results.push(ChildInterestMapper.toDomain(updated));
        } else {
          const created = await tx.childInterest.create({
            data,
          });
          results.push(ChildInterestMapper.toDomain(created));
        }
      }
    });

    return results;
  }
}
