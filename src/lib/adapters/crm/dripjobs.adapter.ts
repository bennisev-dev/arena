import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import type { CRMAdapter, NormalizedPerformanceRecord } from '@/lib/adapters/crm/types';
import { ensureArray, normalizeMonthYear, toNumber } from '@/lib/adapters/crm/shared';

const numericSchema = z.union([z.number(), z.string()]).optional();

const dripJobsRecordSchema = z.object({
  record_id: z.string().optional(),
  recordId: z.string().optional(),
  external_user_id: z.string().optional(),
  externalUserId: z.string().optional(),
  user_id: z.string().optional(),
  userId: z.string().optional(),
  dealership_id: z.string().optional(),
  dealershipId: z.string().optional(),
  dealerId: z.string().optional(),
  storeId: z.string().optional(),
  store_id: z.string().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
  timestamp: z.string().optional(),
  period: z
    .object({
      month: z.number().int().min(1).max(12).optional(),
      year: z.number().int().optional(),
      timestamp: z.string().optional()
    })
    .optional(),
  leadsCreated: numericSchema,
  leads_created: numericSchema,
  carsSold: numericSchema,
  cars_sold: numericSchema,
  vehicleValueTotal: numericSchema,
  vehicle_value_total: numericSchema,
  profitTotal: numericSchema,
  profit_total: numericSchema,
  servicesCompleted: numericSchema,
  services_completed: numericSchema,
  hoursBilled: numericSchema,
  hours_billed: numericSchema,
  hoursWorked: numericSchema,
  hours_worked: numericSchema
});

const dripJobsPayloadSchema = z.object({
  eventId: z.string().optional(),
  event_id: z.string().optional(),
  dealership_id: z.string().optional(),
  dealershipId: z.string().optional(),
  dealerId: z.string().optional(),
  storeId: z.string().optional(),
  store_id: z.string().optional(),
  record: z.record(z.unknown()).optional(),
  records: z.union([dripJobsRecordSchema, z.array(dripJobsRecordSchema)]).optional()
});

// Flat single-record payload (e.g. from Zapier key-value Data) – DripJobs-style field names
const dripJobsFlatRecordSchema = z.object({
  record_id: z.string().optional(),
  recordId: z.string().optional(),
  job_id: z.string().optional(),
  job_proposal_number: z.union([z.string(), z.number()]).optional(),
  external_user_id: z.string().optional(),
  externalUserId: z.string().optional(),
  user_id: z.string().optional(),
  userId: z.string().optional(),
  sales_person_id: z.string().optional(),
  salesperson_id: z.string().optional(),
  rep_id: z.string().optional(),
  assigned_to_id: z.string().optional(),
  dealership_id: z.string().optional(),
  dealershipId: z.string().optional(),
  dealerId: z.string().optional(),
  storeId: z.string().optional(),
  store_id: z.string().optional(),
  time: z.string().optional(),
  timestamp: z.string().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
  job_amount: numericSchema,
  jobAmount: numericSchema,
  amount: numericSchema,
  value: numericSchema,
  vehicle_value_total: numericSchema,
  vehicleValueTotal: numericSchema,
  cars_sold: numericSchema,
  carsSold: numericSchema,
  leads_created: numericSchema,
  leadsCreated: numericSchema,
  profit_total: numericSchema,
  profitTotal: numericSchema
}).passthrough();

export class DripJobsAdapter implements CRMAdapter {
  readonly sourceSystem = 'dripjobs' as const;

  normalize(payload: unknown): NormalizedPerformanceRecord[] {
    const parsed = dripJobsPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error('Invalid DripJobs payload.');
    }

    let records = ensureArray((parsed.data.records as z.infer<typeof dripJobsRecordSchema>[]) || parsed.data.record);

    // If no records array, treat payload as a single flat record (Zapier key-value style)
    if (!records.length) {
      const flat = dripJobsFlatRecordSchema.safeParse(payload);
      if (!flat.success) {
        throw new Error('DripJobs payload must include records or a flat record with dealership_id and external_user_id (or sales_person_id).');
      }
      const d = flat.data;
      const dealershipId = firstAvailableString([
        d.dealership_id,
        d.dealershipId,
        d.dealerId,
        d.storeId,
        d.store_id
      ]);
      const externalUserId = firstAvailableString([
        d.external_user_id,
        d.externalUserId,
        d.user_id,
        d.userId,
        d.sales_person_id,
        d.salesperson_id,
        d.rep_id,
        d.assigned_to_id
      ]);
      if (!dealershipId || !externalUserId) {
        throw new Error('DripJobs payload must include records or a flat record with dealership_id and external_user_id (or sales_person_id).');
      }
      const { month, year } = normalizeMonthYear(d.month, d.year, d.timestamp || d.time);
      records = [{
        record_id: d.record_id ?? d.recordId ?? d.job_id ?? String(d.job_proposal_number ?? 'flat'),
        external_user_id: externalUserId,
        dealership_id: dealershipId,
        month,
        year,
        timestamp: d.timestamp ?? d.time,
        vehicle_value_total: toNumber(d.job_amount ?? d.jobAmount ?? d.amount ?? d.value ?? d.vehicle_value_total ?? d.vehicleValueTotal),
        cars_sold: toNumber(d.cars_sold ?? d.carsSold),
        leads_created: toNumber(d.leads_created ?? d.leadsCreated),
        profit_total: toNumber(d.profit_total ?? d.profitTotal)
      } as z.infer<typeof dripJobsRecordSchema>];
    }

    if (!records.length) {
      throw new Error('DripJobs payload must include records.');
    }

    return records.map((record, index) => {
      const dealershipId = firstAvailableString([
        record.dealership_id,
        record.dealershipId,
        record.dealerId,
        record.storeId,
        record.store_id
      ]);

      if (!dealershipId) {
        throw new Error('Missing dealership id in DripJobs payload.');
      }

      const externalUserId = firstAvailableString([
        record.external_user_id,
        record.externalUserId,
        record.user_id,
        record.userId
      ]);

      if (!externalUserId) {
        throw new Error('Missing external_user_id in DripJobs payload.');
      }

      const eventId = parsed.data.eventId || parsed.data.event_id || 'dripjobs';
      const { month, year } = normalizeMonthYear(record.month, record.year, record.timestamp || record.period?.timestamp);

      return {
        sourceSystem: this.sourceSystem,
        externalRecordId: record.record_id || record.recordId || `${eventId}-${externalUserId}-${month}-${year}-${index}`,
        externalUserId,
        dealershipId,
        month,
        year,
        metrics: {
          leadsCreated: toNumber(record.leadsCreated ?? record.leads_created),
          carsSold: toNumber(record.carsSold ?? record.cars_sold),
          vehicleValueTotal: toNumber(record.vehicleValueTotal ?? record.vehicle_value_total),
          profitTotal: toNumber(record.profitTotal ?? record.profit_total),
          servicesCompleted: toNumber(record.servicesCompleted ?? record.services_completed),
          hoursBilled: toNumber(record.hoursBilled ?? record.hours_billed),
          hoursWorked: toNumber(record.hoursWorked ?? record.hours_worked)
        },
        rawPayload: record as unknown as Prisma.InputJsonValue
      };
    });
  }
}

const firstAvailableString = (values: Array<string | undefined>): string | undefined => {
  return values.find((value): value is string => !!(typeof value === 'string' && value.trim().length));
};
