import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';

export interface Attribute {
  id: string;
  user_id: string;
  company_id: string;
  key: string;
  value: string;
  category: 'technical' | 'compliance' | 'business' | 'product';
  source_doc_id?: string;
  last_updated: string;
}

export function useAttributes() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['attributes'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get<Attribute[]>('/api/attributes/');
      return data;
    },
  });
}