import type { SourceSystem } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export interface NormalizedPerformanceMetrics {
  leadsCreated?: number;
  carsSold?: number;
  vehicleValueTotal?: number;
  profitTotal?: number;
  servicesCompleted?: number;
  hoursBilled?: number;
  hoursWorked?: number;
}

export interface NormalizedPerformanceRecord {
  sourceSystem: SourceSystem;
  externalRecordId: string;
  externalUserId: string;
  dealershipId: string;
  month: number;
  year: number;
  metrics: NormalizedPerformanceMetrics;
  rawPayload: Prisma.InputJsonValue;
}

export interface CRMAdapter {
  readonly sourceSystem: SourceSystem;
  normalize(payload: unknown): NormalizedPerformanceRecord[];
}
