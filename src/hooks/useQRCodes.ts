import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qrService } from '../services/qr';
import type { SortOption, FilterType } from '../types';

export function useQRCodes(params: {
  search?: string;
  type?: FilterType;
  sort?: SortOption;
  page?: number;
}) {
  return useQuery({
    queryKey: ['qr', 'list', params],
    queryFn: () => qrService.list(params),
    staleTime: 30 * 1000,
  });
}

export function useQRCode(id: number) {
  return useQuery({
    queryKey: ['qr', id],
    queryFn: () => qrService.get(id),
    enabled: !!id,
  });
}

export function useCreateUrlQR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: qrService.createUrl,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qr', 'list'] }),
  });
}

export function useCreateFileQR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: qrService.createFile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qr', 'list'] }),
  });
}

export function useUpdateQR(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof qrService.update>[1]) => qrService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qr', id] });
      qc.invalidateQueries({ queryKey: ['qr', 'list'] });
    },
  });
}

export function useDeleteQR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, deleteDriveFile }: { id: number; deleteDriveFile?: boolean }) =>
      qrService.delete(id, deleteDriveFile),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qr', 'list'] }),
  });
}

export function useReplaceFile(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => qrService.replaceFile(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qr', id] });
      qc.invalidateQueries({ queryKey: ['qr', 'list'] });
    },
  });
}
