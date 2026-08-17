import api from './api';
import type { User } from '../types';

const backendBase = import.meta.env.VITE_API_URL || '';

export const authService = {
  getMe: async (): Promise<{ user: User; drive_connected: boolean }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // In production these redirect straight to the backend domain (cross-origin OAuth)
  getGoogleLoginUrl: (): string => {
    return `${backendBase}/api/auth/google`;
  },

  getDriveConnectUrl: (): string => {
    return `${backendBase}/api/auth/drive/connect`;
  },
};
