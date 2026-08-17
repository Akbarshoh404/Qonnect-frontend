import api from './api';
import type { Analytics, AnalyticsPeriod } from '../types';

export const analyticsService = {
  get: async (qrId: number, period: AnalyticsPeriod = '30d'): Promise<Analytics> => {
    const response = await api.get(`/qr/${qrId}/analytics`, { params: { period } });
    return response.data;
  },
};
