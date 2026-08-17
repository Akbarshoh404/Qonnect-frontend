import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { domainsService } from '../services/domains';

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: domainsService.list,
    staleTime: 60 * 1000,
  });
}

export function useAddDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: domainsService.add,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

export function useVerifyDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: domainsService.verify,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

export function useDeleteDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: domainsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

export function useDriveStatus() {
  return useQuery({
    queryKey: ['drive', 'status'],
    queryFn: domainsService.getDriveStatus,
    staleTime: 30 * 1000,
  });
}
