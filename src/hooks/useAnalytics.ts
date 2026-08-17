import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics';
import type { AnalyticsPeriod } from '../types';

export function useAnalytics(qrId: number, period: AnalyticsPeriod = '30d') {
  return useQuery({
    queryKey: ['analytics', qrId, period],
    queryFn: () => analyticsService.get(qrId, period),
    enabled: !!qrId,
    staleTime: 60 * 1000, // 1 minute
  });
}
