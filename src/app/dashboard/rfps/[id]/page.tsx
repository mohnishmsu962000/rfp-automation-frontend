'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import EditAnswerModal from '@/components/modals/EditAnswerModal';
import { useRFP } from '@/hooks/useRFPs';
import { FiArrowLeft, FiEdit2, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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

  const questions = rfp?.questions || [];
  
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return questions.slice(start, start + ITEMS_PER_PAGE);
  }, [questions, currentPage]);

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);

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
    if (normalizedScore >= 70) return 'bg-green-100 text-green-700 border-green-200';
    if (normalizedScore >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/rfps')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              {isEditingName ? (
                <input
                  type="text"
                  value={rfpName}
                  onChange={(e) => setRfpName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingName(false);
                  }}
                  className="text-xl font-semibold text-gray-900 border-b-2 border-brand-primary focus:outline-none bg-transparent"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-brand-primary transition-colors"
                  onClick={() => {
                    setRfpName(rfp.rfp_name);
                    setIsEditingName(true);
                  }}
                >
                  {rfp.rfp_name}
                </h1>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {rfp.created_at ? format(new Date(rfp.created_at), 'MMM d, yyyy') : 'N/A'} · {questions.length} questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {rfp.status === 'processing' && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200">
                <FiLoader className="h-4 w-4 animate-spin" />
                Processing
              </span>
            )}
            <select
              onChange={(e) => handleExport(e.target.value as 'xlsx' | 'docx' | 'pdf')}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>Export</option>
              <option value="xlsx">Excel</option>
              <option value="docx">Word</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase w-12">#</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase w-1/3">Question</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase w-1/2">Answer</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase w-20">Trust</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedQuestions.map((question, index) => {
                const trustScore = getTrustScore(question.trust_score);
                const trustColorClass = getTrustColor(question.trust_score);
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                return (
                  <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-600 font-medium">{globalIndex}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {question.question_text}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 relative group">
                      <div className="line-clamp-2">
                        {question.answer_text || <span className="text-gray-400">No answer</span>}
                      </div>
                      {question.answer_text && (
                        <div className="absolute left-0 top-full mt-2 w-96 p-4 bg-white rounded-lg shadow-2xl border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 max-h-64 overflow-y-auto">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {question.answer_text}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${trustColorClass}`}>
                        {trustScore}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="h-3 w-3" />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, questions.length)} of {questions.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronRight className="h-4 w-4" />
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