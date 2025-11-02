import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsRepositoryPort } from 'src/application/port/out/analytics.repository.port';
import { Analytics } from 'src/domain/model/analytics/entity/analytics.entity';
import { AnalyticsMapper } from './analytics.mapper';

@Injectable()
export class AnalyticsRepositoryAdapter implements AnalyticsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(analytics: Analytics): Promise<Analytics> {
    const data = AnalyticsMapper.toPersistence(analytics);

    const saved = await this.prisma.analytics.create({
      data,
    });

    return AnalyticsMapper.toDomain(saved);
  }

  async findById(id: bigint): Promise<Analytics | null> {
    const record = await this.prisma.analytics.findUnique({
      where: { analytics_id: id },
    });

    return record ? AnalyticsMapper.toDomain(record) : null;
  }

  async findByChildId(childId: number): Promise<Analytics[]> {
    const records = await this.prisma.analytics.findMany({
      where: { child_id: childId },
      orderBy: { created_at: 'desc' },
    });

    return records.map((record) => AnalyticsMapper.toDomain(record));
  }

  async findByConversationId(
    conversationId: bigint,
  ): Promise<Analytics | null> {
    const record = await this.prisma.analytics.findFirst({
      where: { conversation_id: conversationId },
    });

    return record ? AnalyticsMapper.toDomain(record) : null;
  }
}
