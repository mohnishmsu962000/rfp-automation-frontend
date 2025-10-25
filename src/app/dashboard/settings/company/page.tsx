'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'sonner';

export default function CompanyPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const { data: userData, error, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get('/api/users/me');
      console.log('User data:', data);
      return data;
    },
  });
  
  console.log('userData:', userData);
  console.log('error:', error);
  console.log('isLoading:', isLoading);

  const { data: usageData } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get('/api/documents/usage');
      return data;
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (name: string) => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.patch('/api/users/me', {
        company_name: name,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Company name updated successfully');
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

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
            
            <div className="space-y-4">
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
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
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
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{userData?.company_name || 'Loading...'}</span>
                    <button
                      onClick={handleEdit}
                      className="text-brand-primary hover:text-brand-primary/80 transition-colors"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usage & Quotas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Documents</span>
                  <span className="text-xs text-gray-500">of 100</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-semibold text-gray-900">
                    {usageData?.total_documents || 0}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">remaining: {100 - (usageData?.total_documents || 0)}</span>
                </div>
                <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((usageData?.total_documents || 0) / 100) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">RFPs</span>
                  <span className="text-xs text-gray-500">of 50</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-semibold text-gray-900">
                    {usageData?.total_rfps || 0}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">remaining: {50 - (usageData?.total_rfps || 0)}</span>
                </div>
                <div className="mt-3 w-full bg-pink-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((usageData?.total_rfps || 0) / 50) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}