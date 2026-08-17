import api from './api';
import type { CustomDomain } from '../types';

export const domainsService = {
  list: async (): Promise<CustomDomain[]> => {
    const response = await api.get('/domains');
    return response.data.domains;
  },

  add: async (domain: string): Promise<CustomDomain> => {
    const response = await api.post('/domains', { domain });
    return response.data.domain;
  },

  verify: async (id: number): Promise<{ domain: CustomDomain; message?: string; error?: string }> => {
    const response = await api.post(`/domains/${id}/verify`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/domains/${id}`);
  },

  getDriveStatus: async (): Promise<{ connected: boolean; drive_folder_id: string | null }> => {
    const response = await api.get('/drive/status');
    return response.data;
  },

  disconnectDrive: async (): Promise<void> => {
    await api.post('/drive/disconnect');
  },
};
