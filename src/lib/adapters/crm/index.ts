import type { SourceSystem } from '@prisma/client';
import type { CRMAdapter } from '@/lib/adapters/crm/types';
import { EleadAdapter } from '@/lib/adapters/crm/elead.adapter';
import { FortellisAdapter } from '@/lib/adapters/crm/fortellis.adapter';
import { XtimeAdapter } from '@/lib/adapters/crm/xtime.adapter';
import { DripJobsAdapter } from '@/lib/adapters/crm/dripjobs.adapter';

const adapters: Record<SourceSystem, CRMAdapter> = {
  elead: new EleadAdapter(),
  fortellis: new FortellisAdapter(),
  xtime: new XtimeAdapter(),
  dripjobs: new DripJobsAdapter()
};

export const getAdapter = (sourceSystem: SourceSystem): CRMAdapter => {
  return adapters[sourceSystem];
};
