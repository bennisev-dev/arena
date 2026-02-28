import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import type { CRMAdapter, NormalizedPerformanceRecord } from '@/lib/adapters/crm/types';
import { ensureArray, normalizeMonthYear, toNumber } from '@/lib/adapters/crm/shared';

const xtimeRecordSchema = z.object({
  entryId: z.string().optional(),
  externalUserId: z.string(),
  timestamp: z.string().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
  servicesCompleted: z.union([z.number(), z.string()]).optional(),
  hoursBilled: z.union([z.number(), z.string()]).optional(),
  hoursWorked: z.union([z.number(), z.string()]).optional(),
  serviceProfit: z.union([z.number(), z.string()]).optional()
});

const xtimePayloadSchema = z.object({
  eventId: z.string().optional(),
  storeId: z.string(),
  records: z.union([xtimeRecordSchema, z.array(xtimeRecordSchema)])
});

export class XtimeAdapter implements CRMAdapter {
  readonly sourceSystem = 'xtime' as const;

  normalize(payload: unknown): NormalizedPerformanceRecord[] {
    const parsed = xtimePayloadSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error('Invalid Xtime payload.');
    }

    const { storeId, eventId } = parsed.data;
    const records = ensureArray(parsed.data.records);

    return records.map((record, index) => {
      const { month, year } = normalizeMonthYear(record.month, record.year, record.timestamp);

      return {
        sourceSystem: this.sourceSystem,
        externalRecordId: record.entryId ?? `${eventId ?? 'xtime'}-${record.externalUserId}-${month}-${year}-${index}`,
        externalUserId: record.externalUserId,
        dealershipId: storeId,
        month,
        year,
        metrics: {
          servicesCompleted: toNumber(record.servicesCompleted),
          hoursBilled: toNumber(record.hoursBilled),
          hoursWorked: toNumber(record.hoursWorked),
          profitTotal: toNumber(record.serviceProfit)
        },
        rawPayload: record as unknown as Prisma.InputJsonValue
      };
    });
  }
}
