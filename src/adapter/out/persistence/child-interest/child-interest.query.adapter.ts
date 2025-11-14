import { Injectable } from '@nestjs/common';
import { ChildInterestQueryPort } from 'src/application/port/out/child-interest.query.port';
import { ChildInterest } from 'src/domain/model/child-interest/entity/child-interest.entity';
import { PrismaService } from '../prisma/prisma.service';
import { ChildInterestMapper } from './child-interest.mapper';

@Injectable()
export class ChildInterestQueryAdapter implements ChildInterestQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findTopByChildId(childId: number, limit: number): Promise<ChildInterest[]> {
    const records = await this.prisma.childInterest.findMany({
      where: { child_id: childId },
      orderBy: { raw_score: 'desc' },
      take: limit,
    });

    return records.map((record) => ChildInterestMapper.toDomain(record));
  }
}
