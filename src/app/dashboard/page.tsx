'use client';

import StatsCard from '@/components/features/dashboard/StatsCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { HiDocumentText, HiClipboardDocumentList, HiSparkles, HiChartBar } from 'react-icons/hi2';
import { FiUpload, FiFileText, FiTrendingUp, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { useUser } from '@clerk/nextjs';
import { useDocuments } from '@/hooks/useDocuments';
import { useRFPs } from '@/hooks/useRFPs';
import { useUsageStats } from '@/hooks/useStats';
import { useState } from 'react';
import UploadDocumentModal from '@/components/modals/UploadDocumentModal';
import UploadRFPModal from '@/components/modals/UploadRFPModal';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const { data: rfps, isLoading: rfpsLoading } = useRFPs();
  const { data: usage, isLoading: usageLoading } = useUsageStats();
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isRFPModalOpen, setIsRFPModalOpen] = useState(false);
  const router = useRouter();

  const loading = !isLoaded || docsLoading || rfpsLoading || usageLoading;

  const completedRFPs = rfps?.filter(r => r.status === 'completed') || [];
  const processingRFPs = rfps?.filter(r => r.status === 'processing') || [];
  const allQuestions = completedRFPs.flatMap(rfp => rfp.questions || []);
  const getTrustScore = (score: number) => {
    if (score > 1) return Math.min(Math.round(score), 100);
    return Math.min(Math.round(score * 100), 100);
  };
  
  const avgTrust = allQuestions.length > 0
    ? Math.round(allQuestions.reduce((sum, q) => sum + getTrustScore(q.trust_score || 0), 0) / allQuestions.length)
    : 0;

  const recentDocs = documents?.slice(0, 3) || [];
  const recentRFPs = rfps?.slice(0, 3) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.firstName || user?.username || 'there';

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br to-purple-50/30">
        <div className="p-8 max-w-7xl mx-auto space-y-8 pt-16">
          <div className="relative">
            <div className="absolute inset-0 from-brand-primary/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-5xl md:text-3xl font-medium mb-3 bg-gradient-to-r from-brand-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Welcome to ScaleRFP, {firstName}! 👋
                  </h1>
                  <p className="text-lg text-gray-600">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-brand-primary to-purple-600 rounded-[20px] p-8 text-left hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <FiUpload className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-medium text-white mb-2">Upload Document</h3>
                <p className="text-white/80">Add to your knowledge base</p>
              </div>
            </button>

            <button
              onClick={() => setIsRFPModalOpen(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-[20px] p-8 text-left hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <FiFileText className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-medium text-white mb-2">Create RFP</h3>
                <p className="text-white/80">Generate AI-powered responses</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <HiSparkles className="h-6 w-6 text-white" />
                </div>
                <FiTrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-3xl font-medium text-gray-900 mb-1">{avgTrust}%</h3>
              <p className="text-sm text-gray-600 font-medium">Avg Trust Score</p>
              <p className="text-xs text-gray-500 mt-1">Answer confidence</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <HiDocumentText className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-medium text-gray-900 mb-1">{documents?.length || 0}</h3>
              <p className="text-sm text-gray-600 font-medium">Documents</p>
              <p className="text-xs text-gray-500 mt-1">{usage?.docs.remaining || 0} remaining</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <HiClipboardDocumentList className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-medium text-gray-900 mb-1">{rfps?.length || 0}</h3>
              <p className="text-sm text-gray-600 font-medium">RFP Projects</p>
              <p className="text-xs text-gray-500 mt-1">{usage?.rfps.remaining || 0} remaining this month</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                  <HiChartBar className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-medium text-gray-900 mb-1">
                {Math.round((usage?.docs.used || 0) / (usage?.docs.limit || 1) * 100)}%
              </h3>
              <p className="text-sm text-gray-600 font-medium">Quota Usage</p>
              <p className="text-xs text-gray-500 mt-1">Document uploads</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-gray-900">Recent Documents</h2>
                <button
                  onClick={() => router.push('/dashboard/knowledge-base/documents')}
                  className="text-sm text-brand-primary hover:text-purple-600 font-medium flex items-center gap-1"
                >
                  View all
                  <FiArrowRight className="h-4 w-4" />
                </button>
              </div>
              {recentDocs.length > 0 ? (
                <div className="space-y-3">
                  {recentDocs.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <FiFileText className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.filename}</p>
                        <p className="text-xs text-gray-500">
                          {doc.uploaded_at ? format(new Date(doc.uploaded_at), 'MMM d, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <FiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiFileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No documents yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDocModalOpen(true)}
                    className="mt-3"
                  >
                    Upload your first document
                  </Button>
                </div>
              )}
            </Card>

            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-gray-900">Recent RFPs</h2>
                <button
                  onClick={() => router.push('/dashboard/rfps')}
                  className="text-sm text-brand-primary hover:text-purple-600 font-medium flex items-center gap-1"
                >
                  View all
                  <FiArrowRight className="h-4 w-4" />
                </button>
              </div>
              {recentRFPs.length > 0 ? (
                <div className="space-y-3">
                  {recentRFPs.map(rfp => (
                    <div
                      key={rfp.id}
                      onClick={() => router.push(`/dashboard/rfps/${rfp.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center flex-shrink-0">
                        <FiFileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{rfp.rfp_name}</p>
                        <p className="text-xs text-gray-500">
                          {rfp.created_at ? format(new Date(rfp.created_at), 'MMM d, yyyy') : 'N/A'}
                        </p>
                      </div>
                      {rfp.status === 'completed' && <FiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
                      {rfp.status === 'processing' && <FiClock className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiFileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No RFPs yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRFPModalOpen(true)}
                    className="mt-3"
                  >
                    Create your first RFP
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {processingRFPs.length > 0 && (
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FiClock className="h-6 w-6 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Processing RFPs</h3>
                  <p className="text-sm text-gray-600">{processingRFPs.length} RFP{processingRFPs.length > 1 ? 's' : ''} currently being processed</p>
                </div>
              </div>
              <div className="grid gap-3">
                {processingRFPs.map(rfp => (
                  <div key={rfp.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <FiClock className="h-5 w-5 text-blue-600 animate-spin" />
                      <span className="font-medium text-gray-900">{rfp.rfp_name}</span>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">Processing...</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <UploadDocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />

      <UploadRFPModal
        isOpen={isRFPModalOpen}
        onClose={() => setIsRFPModalOpen(false)}
      />
    </>
  );
}