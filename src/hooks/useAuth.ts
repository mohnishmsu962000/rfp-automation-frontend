import { useQuery } from '@tanstack/react-query';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import { User } from '@/types/models';

export function useCurrentUser() {
  const { getToken, isSignedIn } = useClerkAuth();
  
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get<User>('/api/auth/me');
      return data;
    },
    enabled: isSignedIn,
    retry: false,
  });
}