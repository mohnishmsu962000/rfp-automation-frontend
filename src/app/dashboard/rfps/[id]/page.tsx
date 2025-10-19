'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import EditAnswerModal from '@/components/modals/EditAnswerModal';
import { useRFP } from '@/hooks/useRFPs';
import { FiArrowLeft, FiEdit2, FiLoader, FiChevronLeft, FiChevronRight, FiDownload, FiCopy, FiCheck, FiCalendar, FiHash } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { createApiClient } from '@/lib/api-client';
import { useAuth } from '@clerk/nextjs';
import { RFPQuestion } from '@/types/models';

const ITEMS_PER_PAGE = 25;

export default function RFPDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;
  const { data: rfp, isLoading } = useRFP(rfpId);
  const { getToken } = useAuth();

  const [editingQuestion, setEditingQuestion] = useState<RFPQuestion | null>(null);
  const [rfpName, setRfpName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const questions = useMemo(() => rfp?.questions || [], [rfp?.questions]);
  
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return questions.slice(start, start + ITEMS_PER_PAGE);
  }, [questions, currentPage]);

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);

  const handleSaveRfpName = async () => {
    if (!rfpName.trim() || rfpName === rfp?.rfp_name) {
      setIsEditingName(false);
      return;
    }
    
    try {
      const apiClient = createApiClient(getToken);
      await apiClient.patch(`/api/rfps/${rfpId}`, { rfp_name: rfpName });
      toast.success('RFP name updated');
      setIsEditingName(false);
    } catch (error) {
      toast.error('Failed to update RFP name');
      console.error(error);
    }
  };

  const handleCopyAnswer = async (answer: string, id: string) => {
    await navigator.clipboard.writeText(answer);
    setCopiedId(id);
    toast.success('Answer copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = async (format: 'xlsx' | 'docx' | 'pdf') => {
    try {
      const apiClient = createApiClient(getToken);
      const response = await apiClient.get(`/api/rfps/${rfpId}/export?format=${format}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${rfp?.rfp_name}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: unknown) {
      toast.error('Failed to export RFP');
      console.error('Export error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="h-8 w-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">RFP Not Found</h2>
        <Button variant="outline" onClick={() => router.push('/dashboard/rfps')}>
          Back to RFPs
        </Button>
      </div>
    );
  }

  const getTrustScore = (score: number) => {
    if (score > 1) return Math.min(Math.round(score), 100);
    return Math.min(Math.round(score * 100), 100);
  };

  const getTrustColor = (score: number) => {
    const normalizedScore = getTrustScore(score);
    if (normalizedScore >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (normalizedScore >= 85) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <>
      <div className="p-8 px-16 space-y-6">
        <div className="bg-gradient-to-r from-brand-primary/10 via-purple-600/10 to-pink-600/10 rounded-2xl p-6 border border-brand-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/rfps')}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <FiArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                {isEditingName ? (
                  <input
                    type="text"
                    value={rfpName}
                    onChange={(e) => setRfpName(e.target.value)}
                    onBlur={handleSaveRfpName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRfpName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    className="text-2xl font-semibold text-gray-900 border-b-2 border-brand-primary focus:outline-none bg-transparent"
                    autoFocus
                  />
                ) : (
                  <h1
                    className="text-2xl font-semibold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent cursor-pointer hover:from-purple-600 hover:to-brand-primary transition-all"
                    onClick={() => {
                      setRfpName(rfp.rfp_name);
                      setIsEditingName(true);
                    }}
                  >
                    {rfp.rfp_name}
                  </h1>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <FiCalendar className="h-4 w-4 text-brand-primary" />
                    <span>{rfp.created_at ? format(new Date(rfp.created_at), 'MMM d, yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <FiHash className="h-4 w-4 text-brand-primary" />
                    <span>{questions.length} questions</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {rfp.status === 'processing' && (
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200">
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Processing
                </span>
              )}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white border border-gray-200 hover:border-brand-primary transition-colors">
                  <FiDownload className="h-4 w-4" />
                  Export
                </button>
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl border border-gray-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 overflow-hidden">
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full px-4 py-3 text-sm text-left hover:bg-brand-primary/5 hover:text-brand-primary transition-colors"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => handleExport('docx')}
                    className="w-full px-4 py-3 text-sm text-left hover:bg-brand-primary/5 hover:text-brand-primary transition-colors"
                  >
                    Word
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-3 text-sm text-left hover:bg-brand-primary/5 hover:text-brand-primary transition-colors"
                  >
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">#</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">Question</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Answer</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">Trust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedQuestions.map((question, index) => {
                const trustScore = getTrustScore(question.trust_score);
                const trustColorClass = getTrustColor(question.trust_score);
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                return (
                  <tr key={question.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">{globalIndex}</td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900 font-medium">
                        {question.question_text}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative">
                        <div 
                          onClick={() => setEditingQuestion(question)}
                          className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50/50 cursor-pointer hover:border-brand-primary hover:bg-white transition-all group/answer"
                        >
                          <div className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                            {question.answer_text || <span className="text-gray-400 italic">Click to add answer</span>}
                          </div>
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/answer:opacity-100 transition-opacity">
                            {question.answer_text && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyAnswer(question.answer_text!, question.id);
                                }}
                                className="p-1.5 bg-white hover:bg-gray-100 rounded-md shadow-sm border border-gray-200"
                              >
                                {copiedId === question.id ? (
                                  <FiCheck className="h-3.5 w-3.5 text-green-600" />
                                ) : (
                                  <FiCopy className="h-3.5 w-3.5 text-gray-600" />
                                )}
                              </button>
                            )}
                            <button className="p-1.5 bg-white hover:bg-brand-primary/10 rounded-md shadow-sm border border-gray-200">
                              <FiEdit2 className="h-3.5 w-3.5 text-brand-primary" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg border-2 ${trustColorClass}`}>
                        {trustScore}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium text-brand-primary">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-brand-primary">{Math.min(currentPage * ITEMS_PER_PAGE, questions.length)}</span> of <span className="font-medium text-brand-primary">{questions.length}</span> results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-white hover:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-white hover:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {editingQuestion && (
        <EditAnswerModal
          isOpen={true}
          onClose={() => setEditingQuestion(null)}
          question={editingQuestion}
          rfpId={rfpId}
        />
      )}
    </>
  );
}