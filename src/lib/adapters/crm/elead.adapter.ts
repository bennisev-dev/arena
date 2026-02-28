import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import type { CRMAdapter, NormalizedPerformanceRecord } from '@/lib/adapters/crm/types';
import { ensureArray, normalizeMonthYear, toNumber } from '@/lib/adapters/crm/shared';

const eleadRecordSchema = z.object({
  record_id: z.string().optional(),
  external_user_id: z.string(),
  dealership_id: z.string(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
  timestamp: z.string().optional(),
  cars_sold: z.union([z.number(), z.string()]).optional(),
  vehicle_value_total: z.union([z.number(), z.string()]).optional(),
  profit_total: z.union([z.number(), z.string()]).optional(),
  services_completed: z.union([z.number(), z.string()]).optional(),
  hours_billed: z.union([z.number(), z.string()]).optional(),
  hours_worked: z.union([z.number(), z.string()]).optional()
});

const eleadPayloadSchema = z.object({
  event_id: z.string().optional(),
  records: z.union([eleadRecordSchema, z.array(eleadRecordSchema)]).optional()
});

export class EleadAdapter implements CRMAdapter {
  readonly sourceSystem = 'elead' as const;

  normalize(payload: unknown): NormalizedPerformanceRecord[] {
    const parsed = eleadPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error('Invalid Elead payload.');
    }

    const data = parsed.data;
    const records = ensureArray(data.records);

    return records.map((record, index) => {
      const { month, year } = normalizeMonthYear(record.month, record.year, record.timestamp);

      return {
        sourceSystem: this.sourceSystem,
        externalRecordId: record.record_id ?? `${data.event_id ?? 'elead'}-${record.external_user_id}-${month}-${year}-${index}`,
        externalUserId: record.external_user_id,
        dealershipId: record.dealership_id,
        month,
        year,
        metrics: {
          carsSold: toNumber(record.cars_sold),
          vehicleValueTotal: toNumber(record.vehicle_value_total),
          profitTotal: toNumber(record.profit_total),
          servicesCompleted: toNumber(record.services_completed),
          hoursBilled: toNumber(record.hours_billed),
          hoursWorked: toNumber(record.hours_worked)
        },
        rawPayload: record as unknown as Prisma.InputJsonValue
      };
    });
  }
}
