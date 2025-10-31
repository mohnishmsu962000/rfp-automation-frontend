'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { getToken } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get('/api/users/me');
      return data;
    },
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && (error || !data)) {
      router.push('/onboarding');
    }
  }, [data, error, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 ml-17 p-3">
        <div className="bg-gradient-to-br from-[#fffbee] via-[#f8f6ff] to-[#fdf4ff] rounded-[20px] border-1 border-gray-300 shadow-md min-h-full relative">
          {children}
        </div>
      </main>
    </div>
  );
}