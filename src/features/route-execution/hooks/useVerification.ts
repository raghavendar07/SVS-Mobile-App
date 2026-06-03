import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@db';
import { queryKeys } from '@core/query';
import type { StartVerification } from '@shared/types';
import { verificationDao, type SaveVerificationInput } from '../db/verification.dao';

/** Live latest verification for a route (undefined until captured). */
export function useStartVerification(routeId: string): StartVerification | undefined {
  return useLiveQuery(
    async () => (routeId ? await verificationDao.getLatest(routeId) : undefined),
    [routeId],
    undefined,
  );
}

/** Quick boolean for CTA gating: true when a verification row exists locally. */
export function useHasVerification(routeId: string): boolean {
  const count =
    useLiveQuery(
      async () => (routeId ? await db.verifications.where('routeId').equals(routeId).count() : 0),
      [routeId],
      0,
    ) ?? 0;
  return count > 0;
}

export function useSaveVerification(routeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<SaveVerificationInput, 'routeId'>) =>
      verificationDao.save({ ...input, routeId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.routes.detail(routeId) });
    },
  });
}
