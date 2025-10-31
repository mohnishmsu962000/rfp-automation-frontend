'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import { useUsageStats } from '@/hooks/useStats';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiEdit2, FiCheck, FiX, FiFileText, FiTrendingUp, FiPackage } from 'react-icons/fi';
import { toast } from 'sonner';

export default function CompanyPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get('/api/users/me');
      return data;
    },
  });

  const { data: usageData } = useUsageStats();

  const updateCompanyMutation = useMutation({
    mutationFn: async (name: string) => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.patch('/api/users/me', {
        company_name: name,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Company name updated');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update company name');
    },
  });

  const handleEdit = () => {
    setCompanyName(userData?.company_name || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!companyName.trim()) {
      toast.error('Company name cannot be empty');
      return;
    }
    updateCompanyMutation.mutate(companyName);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCompanyName('');
  };

  const docsPercentage = usageData?.docs ? (usageData.docs.used / usageData.docs.limit) * 100 : 0;
  const rfpsPercentage = usageData?.rfps ? (usageData.rfps.used / usageData.rfps.limit) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiPackage className="h-5 w-5 text-brand-primary" />
            Company Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            {isEditing ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  autoFocus
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  isLoading={updateCompanyMutation.isPending}
                >
                  <FiCheck className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={updateCompanyMutation.isPending}
                >
                  <FiX className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-900 font-medium">{userData?.company_name || 'Loading...'}</span>
                <button
                  onClick={handleEdit}
                  className="text-brand-primary hover:text-brand-primary/80 transition-colors p-1 hover:bg-purple-50 rounded"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FiTrendingUp className="h-5 w-5 text-brand-primary" />
              Usage & Quotas
            </h3>
            <div className="text-sm text-gray-500">
              Current Plan: <span className="font-semibold text-brand-primary capitalize">{usageData?.plan?.name || 'Free'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <FiFileText className="h-5 w-5 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">Documents</div>
                  <div className="text-xs text-gray-500">Knowledge base uploads</div>
                </div>
              </div>
              
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-gray-900">
                  {usageData?.docs?.used || 0}
                </span>
                <span className="text-lg text-gray-600 mb-1">/ {usageData?.docs?.limit || 0}</span>
              </div>
              
              <div className="w-full bg-purple-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-brand-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(docsPercentage, 100)}%` }}
                />
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">{usageData?.docs?.remaining || 0}</span> documents remaining
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl border border-pink-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <FiFileText className="h-5 w-5 text-pink-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">RFPs Processed</div>
                  <div className="text-xs text-gray-500">Monthly quota</div>
                </div>
              </div>
              
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-gray-900">
                  {usageData?.rfps?.used || 0}
                </span>
                <span className="text-lg text-gray-600 mb-1">/ {usageData?.rfps?.limit || 0}</span>
              </div>
              
              <div className="w-full bg-pink-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(rfpsPercentage, 100)}%` }}
                />
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">{usageData?.rfps?.remaining || 0}</span> RFPs remaining
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 mt-0.5">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900 mb-1">Usage resets monthly</div>
                <div className="text-xs text-blue-700">Your quotas will reset on the 1st of next month.</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}