'use client';

import StatsCard from '@/components/features/dashboard/StatsCard';
import Button from '@/components/ui/Button';
import { HiDocumentText, HiClipboardDocumentList, HiSparkles, HiChartBar } from 'react-icons/hi2';
import { useAuth, useUser } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';

interface RFP {
  questions?: Array<{ trust_score?: number }>;
}

interface ErrorResponse {
  response?: {
    status?: number;
  };
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [stats, setStats] = useState({
    avgTrust: 0,
    docCount: 0,
    rfpCount: 0,
    quotaUsage: 0,
    docsRemaining: 0,
    rfpsRemaining: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      if (!user) {
        console.log('No user yet');
        return;
      }

      try {
        const token = await getToken();
        console.log('Token retrieved:', token ? 'Yes' : 'No');
        console.log('Token preview:', token?.substring(0, 20) + '...');
        
        const apiClient = createApiClient(getToken);
        
        try {
          console.log('Trying /api/auth/me...');
          await apiClient.get('/api/auth/me');
          console.log('/api/auth/me succeeded');
        } catch (error) {
          const err = error as ErrorResponse;
          console.log('/api/auth/me failed:', err.response?.status);
          
          if (err.response?.status === 401 || err.response?.status === 403) {
            console.log('Attempting onboarding...');
            const onboardRes = await apiClient.post('/api/auth/onboard', {
              company_name: 'Default Company',
              user_name: user.fullName || user.emailAddresses[0].emailAddress,
              user_email: user.emailAddresses[0].emailAddress,
            });
            console.log('Onboarding response:', onboardRes.data);
          }
        }

        const [docsRes, rfpsRes, usageRes] = await Promise.all([
          apiClient.get('/api/documents/'),
          apiClient.get('/api/rfps/'),
          apiClient.get('/api/documents/usage')
        ]);

        const docs = docsRes.data;
        const rfps: RFP[] = rfpsRes.data;
        const usage = usageRes.data;

        const allQuestions = rfps.flatMap((rfp: RFP) => rfp.questions || []);
        const avgTrust = allQuestions.length > 0
          ? Math.round(allQuestions.reduce((sum: number, q) => sum + (q.trust_score || 0), 0) / allQuestions.length)
          : 0;

        setStats({
          avgTrust,
          docCount: docs.length,
          rfpCount: rfps.length,
          quotaUsage: Math.round((usage.documents.used / usage.documents.limit) * 100),
          docsRemaining: usage.documents.remaining,
          rfpsRemaining: usage.rfps.remaining
        });

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    initUser();
  }, [getToken, user]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[100px] font-semibold mb-2 bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#C4B5FD] bg-clip-text text-transparent">
          Hey, Mohnish
        </h1>
        <p className="text-gray-600">Welcome back! Here&apos;s your RFP automation overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Avg Trust Score"
          value={`${stats.avgTrust}%`}
          icon={<HiSparkles size={48} />}
          description="Answer confidence"
        />
        <StatsCard
          title="Documents"
          value={stats.docCount}
          icon={<HiDocumentText size={48} />}
          description={`${stats.docsRemaining} remaining`}
        />
        <StatsCard
          title="RFP Projects"
          value={stats.rfpCount}
          icon={<HiClipboardDocumentList size={48} />}
          description={`${stats.rfpsRemaining} remaining this month`}
        />
        <StatsCard
          title="Quota Usage"
          value={`${stats.quotaUsage}%`}
          icon={<HiChartBar size={48} />}
          description="Document uploads"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Button size="lg" className="w-full">
          Upload Document
        </Button>
        <Button size="lg" variant="secondary" className="w-full">
          Create RFP
        </Button>
      </div>
    </div>
  );
}