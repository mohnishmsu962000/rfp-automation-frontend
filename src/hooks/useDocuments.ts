import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import { Document } from '@/types/models';

export function useDocuments(enabled: boolean = true) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get<Document[]>('/api/documents/');
      return data;
    },
    enabled,
    retry: false,
  });
}