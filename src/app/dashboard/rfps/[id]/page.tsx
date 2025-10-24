'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRFP, useUpdateAnswer } from '@/hooks/useRFPs';
import { FiArrowLeft, FiLoader, FiCopy, FiCheck, FiDownload, FiRefreshCw, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { createApiClient } from '@/lib/api-client';
import { useAuth } from '@clerk/nextjs';
import RichTextEditor from '@/components/editor/RichTextEditor';
import ReactMarkdown from 'react-markdown';

export default function RFPDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;
  const { data: rfp, isLoading } = useRFP(rfpId);
  const { getToken } = useAuth();
  const updateAnswer = useUpdateAnswer();

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rephraseInstruction, setRephraseInstruction] = useState('');
  const [rfpName, setRfpName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const questions = useMemo(() => rfp?.questions || [], [rfp?.questions]);
  const selectedQuestion = useMemo(
    () => questions.find(q => q.id === selectedQuestionId),
    [questions, selectedQuestionId]
  );

  useEffect(() => {
    if (questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [questions, selectedQuestionId]);

  useEffect(() => {
    if (selectedQuestion?.answer_text) {
      setEditorContent(selectedQuestion.answer_text);
      setHasUnsavedChanges(false);
    }
  }, [selectedQuestion?.id]);

  useEffect(() => {
    if (selectedQuestion && editorContent !== selectedQuestion.answer_text) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [editorContent, selectedQuestion]);

  const handleSave = async () => {
    if (!selectedQuestion || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      await updateAnswer.mutateAsync({
        rfpId,
        questionId: selectedQuestion.id,
        answerText: editorContent,
      });
      toast.success('Answer saved');
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error('Failed to save answer');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleCopy = async () => {
    if (!editorContent) return;
    await navigator.clipboard.writeText(editorContent);
    setCopied(true);
    toast.success('Answer copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRephrase = async () => {
    if (!selectedQuestion || !editorContent || !rephraseInstruction.trim()) return;
    
    setIsRephrasing(true);
    try {
      const apiClient = createApiClient(getToken);
      const response = await apiClient.post(`/api/rfps/${rfpId}/questions/${selectedQuestion.id}/rephrase`, {
        current_answer: editorContent,
        instruction: rephraseInstruction,
      });
      
      setEditorContent(response.data.rephrased_answer);
      toast.success('Answer rephrased');
      setRephraseInstruction('');
    } catch (error) {
      toast.error('Failed to rephrase');
      console.error(error);
    } finally {
      setIsRephrasing(false);
    }
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
    } catch (error) {
      toast.error('Failed to export');
      console.error(error);
    }
  };

  const getTrustScore = (score: number) => {
    if (score > 1) return Math.min(Math.round(score), 100);
    return Math.min(Math.round(score * 100), 100);
  };

  const getTrustColor = (score: number) => {
    const normalizedScore = getTrustScore(score);
    if (normalizedScore >= 90) return 'bg-green-500';
    if (normalizedScore >= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrustTextColor = (score: number) => {
    const normalizedScore = getTrustScore(score);
    if (normalizedScore >= 90) return 'text-green-600';
    if (normalizedScore >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="h-6 w-6 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-lg font-medium text-gray-900 mb-3">RFP Not Found</h2>
        <button
          onClick={() => router.push('/dashboard/rfps')}
          className="text-sm text-gray-600 hover:text-brand-primary"
        >
          ← Back to RFPs
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/rfps')}
              className="text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="h-5 w-5" />
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
                  className="text-lg font-medium text-gray-900 border-b-2 border-brand-primary focus:outline-none bg-transparent"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-lg font-medium text-gray-900 cursor-pointer hover:text-brand-primary"
                  onClick={() => {
                    setRfpName(rfp.rfp_name);
                    setIsEditingName(true);
                  }}
                >
                  {rfp.rfp_name}
                </h1>
              )}
              <p className="text-sm text-gray-500 mt-0.5">
                {questions.length} questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {rfp.status === 'processing' && (
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <FiLoader className="h-4 w-4 animate-spin" />
                Processing
              </span>
            )}
            <div className="relative group">
              <button className="text-sm text-gray-700 hover:text-brand-primary flex items-center gap-2">
                <FiDownload className="h-4 w-4" />
                Export
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg border border-gray-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                <button
                  onClick={() => handleExport('xlsx')}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                >
                  Excel
                </button>
                <button
                  onClick={() => handleExport('docx')}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                >
                  Word
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-96 overflow-y-auto">
          <div className="p-4">
            {questions.map((question, index) => {
              const trustScore = getTrustScore(question.trust_score);
              const isSelected = selectedQuestionId === question.id;
              
              return (
                <button
                  key={question.id}
                  onClick={() => setSelectedQuestionId(question.id)}
                  className={`w-full text-left p-3 rounded-tr-4xl rounded-br-4xl mb-2 transition-colors ${
                    isSelected
                      ? 'bg-brand-primary/10 border-l-4 border-brand-primary'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-sm font-medium mt-0.5 ${isSelected ? 'text-brand-primary' : 'text-gray-400'}`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-base leading-relaxed mb-2 ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                        {question.question_text}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${getTrustColor(question.trust_score)}`} />
                        <span className={`text-xs font-medium ${getTrustTextColor(question.trust_score)}`}>
                          {trustScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          {selectedQuestion ? (
            <div className="max-w-4xl">
              <div className="mb-6 flex items-start justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 flex-1">
                  {selectedQuestion.question_text}
                </h2>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={handleCopy}
                    disabled={!editorContent}
                    className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Copy answer"
                  >
                    {copied ? <FiCheck className="h-5 w-5" /> : <FiCopy className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || isSaving}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                      hasUnsavedChanges
                        ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FiSave className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              <RichTextEditor
                content={editorContent}
                onChange={setEditorContent}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">Select a question to view and edit</p>
            </div>
          )}
        </main>

        <aside className="w-80 overflow-y-auto px-6 py-6">
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FiRefreshCw className="h-4 w-4" />
                  AI rephrase
                </label>
                <textarea
                  value={rephraseInstruction}
                  onChange={(e) => setRephraseInstruction(e.target.value)}
                  placeholder="How would you like to rephrase this answer?"
                  className="w-full h-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary resize-none"
                  disabled={!editorContent}
                />
                <button
                  onClick={handleRephrase}
                  disabled={isRephrasing || !rephraseInstruction.trim() || !editorContent}
                  className="w-full px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRephrasing ? 'Rephrasing...' : 'Rephrase'}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}