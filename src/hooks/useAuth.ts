import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth';
import type { User } from '../types';

export function useAuth() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: data?.user as User | undefined,
    driveConnected: data?.drive_connected ?? false,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
    refetch,
  };
}
