import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import { UsageStats } from '@/types/models';

export function useUsageStats(enabled: boolean = true) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['usage-stats'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get<UsageStats>('/api/documents/usage');
      return data;
    },
    enabled,
    retry: false,
  });
}