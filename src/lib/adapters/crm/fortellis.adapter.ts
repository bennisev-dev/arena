import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import type { CRMAdapter, NormalizedPerformanceRecord } from '@/lib/adapters/crm/types';
import { ensureArray, normalizeMonthYear, toNumber } from '@/lib/adapters/crm/shared';

const fortellisRecordSchema = z.object({
  id: z.string().optional(),
  userExternalId: z.string(),
  period: z
    .object({
      month: z.number().int().min(1).max(12).optional(),
      year: z.number().int().optional(),
      timestamp: z.string().optional()
    })
    .optional(),
  sales: z
    .object({
      units: z.union([z.number(), z.string()]).optional(),
      totalVehicleValue: z.union([z.number(), z.string()]).optional(),
      grossProfit: z.union([z.number(), z.string()]).optional()
    })
    .optional(),
  service: z
    .object({
      completed: z.union([z.number(), z.string()]).optional(),
      hoursBilled: z.union([z.number(), z.string()]).optional(),
      hoursWorked: z.union([z.number(), z.string()]).optional(),
      profit: z.union([z.number(), z.string()]).optional()
    })
    .optional()
});

const fortellisPayloadSchema = z.object({
  eventId: z.string().optional(),
  dealerId: z.string(),
  records: z.union([fortellisRecordSchema, z.array(fortellisRecordSchema)])
});

export class FortellisAdapter implements CRMAdapter {
  readonly sourceSystem = 'fortellis' as const;

  normalize(payload: unknown): NormalizedPerformanceRecord[] {
    const parsed = fortellisPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error('Invalid Fortellis payload.');
    }

    const { dealerId, eventId } = parsed.data;
    const records = ensureArray(parsed.data.records);

    return records.map((record, index) => {
      const { month, year } = normalizeMonthYear(record.period?.month, record.period?.year, record.period?.timestamp);

      return {
        sourceSystem: this.sourceSystem,
        externalRecordId: record.id ?? `${eventId ?? 'fortellis'}-${record.userExternalId}-${month}-${year}-${index}`,
        externalUserId: record.userExternalId,
        dealershipId: dealerId,
        month,
        year,
        metrics: {
          carsSold: toNumber(record.sales?.units),
          vehicleValueTotal: toNumber(record.sales?.totalVehicleValue),
          profitTotal: toNumber(record.sales?.grossProfit) + toNumber(record.service?.profit),
          servicesCompleted: toNumber(record.service?.completed),
          hoursBilled: toNumber(record.service?.hoursBilled),
          hoursWorked: toNumber(record.service?.hoursWorked)
        },
        rawPayload: record as unknown as Prisma.InputJsonValue
      };
    });
  }
}
