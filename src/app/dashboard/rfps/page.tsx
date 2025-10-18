'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import UploadRFPModal from '@/components/modals/UploadRFPModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { useRFPs } from '@/hooks/useRFPs';
import { FiFileText, FiUpload, FiLoader, FiClock, FiCheckCircle, FiAlertCircle, FiSearch, FiFilter, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { RFPProject } from '@/types/models';

const STATUS_CONFIG: Record<RFPProject['status'], { icon: React.ComponentType<{ className?: string }>; color: string; label: string; bgColor: string }> = {
  pending: { 
    icon: FiClock, 
    color: 'text-yellow-700', 
    label: 'Pending',
    bgColor: 'bg-yellow-50 border-yellow-200'
  },
  processing: { 
    icon: FiLoader, 
    color: 'text-blue-700', 
    label: 'Processing',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  completed: { 
    icon: FiCheckCircle, 
    color: 'text-green-700', 
    label: 'Completed',
    bgColor: 'bg-green-50 border-green-200'
  },
  failed: { 
    icon: FiAlertCircle, 
    color: 'text-red-700', 
    label: 'Failed',
    bgColor: 'bg-red-50 border-red-200'
  },
};

type SortOption = 'newest' | 'oldest' | 'name' | 'questions';
type StatusFilter = 'all' | RFPProject['status'];

export default function RFPsPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingRFP, setDeletingRFP] = useState<RFPProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { data: rfps, isLoading } = useRFPs();
  const router = useRouter();

  const filteredAndSortedRFPs = useMemo(() => {
    if (!rfps) return [];

    const filtered = rfps.filter(rfp => {
      const matchesSearch = rfp.rfp_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || rfp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.rfp_name.localeCompare(b.rfp_name);
        case 'questions':
          return (b.questions?.length || 0) - (a.questions?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [rfps, searchQuery, sortBy, statusFilter]);

  const handleRFPClick = (rfpId: string) => {
    router.push(`/dashboard/rfps/${rfpId}`);
  };

  const statusCounts = useMemo(() => {
    if (!rfps) return { all: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
    return {
      all: rfps.length,
      pending: rfps.filter(r => r.status === 'pending').length,
      processing: rfps.filter(r => r.status === 'processing').length,
      completed: rfps.filter(r => r.status === 'completed').length,
      failed: rfps.filter(r => r.status === 'failed').length,
    };
  }, [rfps]);

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              RFP Projects
            </h1>
            <p className="text-gray-600 mt-2">Upload and manage your RFP responses with AI</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-600 hover:to-brand-primary shadow-lg"
          >
            <FiUpload className="mr-2 h-4 w-4" />
            Upload RFP
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search RFPs by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors cursor-pointer text-sm font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="questions">Most Questions</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors cursor-pointer text-sm font-medium"
              >
                <option value="all">All Status ({statusCounts.all})</option>
                <option value="completed">Completed ({statusCounts.completed})</option>
                <option value="processing">Processing ({statusCounts.processing})</option>
                <option value="pending">Pending ({statusCounts.pending})</option>
                <option value="failed">Failed ({statusCounts.failed})</option>
              </select>
              <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12">
              <FiLoader className="h-8 w-8 text-brand-primary animate-spin" />
            </div>
          </Card>
        ) : filteredAndSortedRFPs.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={<FiFileText className="h-12 w-12" />}
              title={searchQuery || statusFilter !== 'all' ? 'No RFPs found' : 'No RFP projects yet'}
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first RFP document to get started. Our AI will extract questions and generate answers using your knowledge base.'
              }
              action={
                !searchQuery && statusFilter === 'all' ? (
                  <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
                    <FiUpload className="mr-2 h-4 w-4" />
                    Upload RFP
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">RFP Name</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Status</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Questions</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">Created</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedRFPs.map((rfp) => {
                  const StatusIcon = STATUS_CONFIG[rfp.status].icon;
                  const questionCount = rfp.questions?.length || 0;

                  return (
                    <tr key={rfp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <FiFileText className="h-5 w-5 text-brand-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">{rfp.rfp_name}</p>
                            <p className="text-xs text-gray-500 truncate">{rfp.rfp_file_url.split('/').pop()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${STATUS_CONFIG[rfp.status].bgColor} ${STATUS_CONFIG[rfp.status].color}`}>
                          <StatusIcon className={`h-3.5 w-3.5 ${rfp.status === 'processing' ? 'animate-spin' : ''}`} />
                          {STATUS_CONFIG[rfp.status].label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {rfp.status === 'completed' ? (
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-sm">
                            {questionCount}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-gray-600">
                        {rfp.created_at ? format(new Date(rfp.created_at), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleRFPClick(rfp.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-600 hover:to-brand-primary rounded-lg transition-all shadow-md hover:shadow-lg"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingRFP(rfp);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          >
                            <FiTrash2 className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UploadRFPModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {deletingRFP && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeletingRFP(null)}
          title="Delete RFP Project"
          description={`Are you sure you want to delete "${deletingRFP.rfp_name}"? This will remove all associated questions and answers. This action cannot be undone.`}
          itemId={deletingRFP.id}
          endpoint="/api/rfps"
          queryKey="rfps"
          successMessage="RFP deleted successfully"
        />
      )}
    </>
  );
}