import { Injectable } from '@nestjs/common';
import { ChildInterestQueryPort } from 'src/application/port/out/child-interest.query.port';
import { ChildInterest } from 'src/domain/model/child-interest/entity/child-interest.entity';
import { PrismaService } from '../prisma/prisma.service';
import { ChildInterestMapper } from './child-interest.mapper';

@Injectable()
export class ChildInterestQueryAdapter implements ChildInterestQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findTopByChildId(childId: number): Promise<ChildInterest | null> {
    const record = await this.prisma.childInterest.findFirst({
      where: { child_id: childId },
      orderBy: { raw_score: 'desc' },
    });

    if (!record) {
      return null;
    }

    return ChildInterestMapper.toDomain(record);
  }
}
