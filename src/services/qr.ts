import api from './api';
import type { QrCode, PaginatedQrCodes, SortOption, FilterType } from '../types';

export const qrService = {
  list: async (params: {
    search?: string;
    type?: FilterType;
    sort?: SortOption;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedQrCodes> => {
    const response = await api.get('/qr', { params });
    return response.data;
  },

  get: async (id: number): Promise<QrCode> => {
    const response = await api.get(`/qr/${id}`);
    return response.data.qr_code;
  },

  createUrl: async (data: {
    title: string;
    destination_url: string;
    custom_domain_id?: number | null;
  }): Promise<QrCode> => {
    const response = await api.post('/qr', { ...data, type: 'url' });
    return response.data.qr_code;
  },

  createFile: async (data: {
    title: string;
    file: File;
    custom_domain_id?: number | null;
  }): Promise<QrCode> => {
    const formData = new FormData();
    formData.append('type', 'file');
    formData.append('title', data.title);
    formData.append('file', data.file);
    if (data.custom_domain_id) {
      formData.append('custom_domain_id', String(data.custom_domain_id));
    }
    const response = await api.post('/qr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.qr_code;
  },

  update: async (
    id: number,
    data: Partial<{
      title: string;
      destination_url: string;
      is_active: boolean;
      custom_domain_id: number | null;
    }>
  ): Promise<QrCode> => {
    const response = await api.patch(`/qr/${id}`, data);
    return response.data.qr_code;
  },

  delete: async (id: number, deleteDriveFile = false): Promise<void> => {
    await api.delete(`/qr/${id}`, {
      data: { delete_drive_file: deleteDriveFile },
    });
  },

  replaceFile: async (id: number, file: File): Promise<{ message: string; qr_code: QrCode }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/qr/${id}/replace-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getImageUrl: (id: number, format: 'png' | 'svg' = 'png', size = 10): string => {
    return `/api/qr/${id}/image?format=${format}&size=${size}`;
  },

  downloadImage: async (id: number, format: 'png' | 'svg', shortCode: string): Promise<void> => {
    const response = await api.get(`/qr/${id}/image`, {
      params: { format, size: 12 },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], {
      type: format === 'svg' ? 'image/svg+xml' : 'image/png',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qonnect-${shortCode}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  },

  downloadFile: async (id: number, filename: string): Promise<void> => {
    const response = await api.get(`/qr/${id}/download`, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
