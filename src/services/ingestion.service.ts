import { Prisma } from '@prisma/client';
import type { SourceSystem } from '@prisma/client';
import { db } from '@/lib/db';
import { getAdapter } from '@/lib/adapters/crm';

const toDecimalIncrement = (value: number): Prisma.Decimal => {
  return new Prisma.Decimal(value || 0);
};

interface IngestionResult {
  sourceSystem: SourceSystem;
  totalRecords: number;
  processedRecords: number;
  skippedDuplicates: number;
  unmatchedUsers: number;
}

export const ingestPayload = async (sourceSystem: SourceSystem, payload: unknown): Promise<IngestionResult> => {
  const adapter = getAdapter(sourceSystem);
  const records = adapter.normalize(payload);

  let processedRecords = 0;
  let skippedDuplicates = 0;
  let unmatchedUsers = 0;

  for (const record of records) {
    try {
      const rawIngest = await db.rawIngest.create({
        data: {
          source_system: sourceSystem,
          external_record_id: record.externalRecordId,
          payload: record.rawPayload
        }
      });

      const user = await db.user.findFirst({
        where: {
          dealership_id: record.dealershipId,
          external_user_id: record.externalUserId
        }
      });

      if (!user) {
        unmatchedUsers += 1;

        await db.rawIngest.update({
          where: { id: rawIngest.id },
          data: {
            error_message: `No user found for external_user_id=${record.externalUserId} dealership_id=${record.dealershipId}`
          }
        });
        continue;
      }

      const performance = await db.performance.upsert({
        where: {
          user_id_month_year: {
            user_id: user.id,
            month: record.month,
            year: record.year
          }
        },
        create: {
          user_id: user.id,
          month: record.month,
          year: record.year,
          leads_created: record.metrics.leadsCreated ?? 0,
          cars_sold: record.metrics.carsSold ?? 0,
          vehicle_value_total: toDecimalIncrement(record.metrics.vehicleValueTotal ?? 0),
          profit_total: toDecimalIncrement(record.metrics.profitTotal ?? 0),
          services_completed: record.metrics.servicesCompleted ?? 0,
          hours_billed: toDecimalIncrement(record.metrics.hoursBilled ?? 0),
          hours_worked: toDecimalIncrement(record.metrics.hoursWorked ?? 0)
        },
        update: {
          leads_created: { increment: record.metrics.leadsCreated ?? 0 },
          cars_sold: { increment: record.metrics.carsSold ?? 0 },
          vehicle_value_total: { increment: toDecimalIncrement(record.metrics.vehicleValueTotal ?? 0) },
          profit_total: { increment: toDecimalIncrement(record.metrics.profitTotal ?? 0) },
          services_completed: { increment: record.metrics.servicesCompleted ?? 0 },
          hours_billed: { increment: toDecimalIncrement(record.metrics.hoursBilled ?? 0) },
          hours_worked: { increment: toDecimalIncrement(record.metrics.hoursWorked ?? 0) }
        }
      });

      await db.rawIngest.update({
        where: { id: rawIngest.id },
        data: {
          processed_user_id: user.id,
          processed_performance_id: performance.id
        }
      });

      processedRecords += 1;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        skippedDuplicates += 1;
        continue;
      }

      throw error;
    }
  }

  return {
    sourceSystem,
    totalRecords: records.length,
    processedRecords,
    skippedDuplicates,
    unmatchedUsers
  };
};
