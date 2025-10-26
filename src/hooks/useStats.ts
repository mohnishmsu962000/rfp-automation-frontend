import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';

export interface BillingPlan {
  tier: string;
  status: string;
  plan_name: string;
  price: number;
  rfp_limit: number;
  doc_limit: number;
  razorpay_subscription_id: string | null;
  current_period_end: string | null;
}

export interface UsageStats {
  month: string;
  rfps: {
    used: number;
    limit: number;
    remaining: number;
  };
  docs: {
    used: number;
    limit: number;
    remaining: number;
  };
  plan: {
    tier: string;
    name: string;
  };
}

export function useUsageStats(enabled: boolean = true) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['usage-stats'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get<UsageStats>('/billing/usage');
      return data;
    },
    enabled,
    retry: false,
  });
}

export function useBillingPlan(enabled: boolean = true) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['billing-plan'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get<BillingPlan>('/billing/status');
      return data;
    },
    enabled,
    retry: false,
  });
}// force rebuild
