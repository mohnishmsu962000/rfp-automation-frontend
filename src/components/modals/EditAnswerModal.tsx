'use client';

import { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useUpdateAnswer, useRephraseAnswer } from '@/hooks/useRFPs';
import { FiSave, FiX, FiZap, FiLoader, FiCopy, FiCheck, FiBold, FiItalic, FiList, FiAlignLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { RFPQuestion } from '@/types/models';

interface EditAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: RFPQuestion;
  rfpId: string;
}

export default function EditAnswerModal({ isOpen, onClose, question, rfpId }: EditAnswerModalProps) {
  const [editedAnswer, setEditedAnswer] = useState(question.answer_text || '');
  const [instruction, setInstruction] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateAnswer = useUpdateAnswer();
  const rephraseAnswer = useRephraseAnswer();

  const handleSave = async () => {
    try {
      await updateAnswer.mutateAsync({
        rfpId,
        questionId: question.id,
        answerText: editedAnswer,
      });
      toast.success('Answer updated successfully');
      onClose();
    } catch (error: unknown) {
      console.error('Error updating answer:', error);
      toast.error('Failed to update answer');
    }
  };

  const handleRephrase = async () => {
    if (!instruction.trim()) {
      toast.error('Please provide AI instructions');
      return;
    }

    try {
      const result = await rephraseAnswer.mutateAsync({
        rfpId,
        questionId: question.id,
        instruction,
      });
      setEditedAnswer(result.rephrased_answer);
      setInstruction('');
      toast.success('Answer rephrased! Review and save if you like it.');
    } catch (error: unknown) {
      console.error('Error rephrasing answer:', error);
      toast.error('Failed to rephrase answer');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedAnswer);
    setCopied(true);
    toast.success('Answer copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedAnswer.substring(start, end);
    const newText = editedAnswer.substring(0, start) + before + selectedText + after + editedAnswer.substring(end);
    
    setEditedAnswer(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const getTrustScore = (score: number) => {
    if (score > 1) return Math.min(Math.round(score), 100);
    return Math.min(Math.round(score * 100), 100);
  };

  const getTrustColor = () => {
    const score = getTrustScore(question.trust_score);
    if (score >= 90) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 85) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Answer" size="xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Question</label>
          <div className="p-4 bg-gradient-to-r from-brand-primary/5 to-purple-600/5 rounded-xl text-sm text-gray-900 border border-brand-primary/20">
            {question.question_text}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Answer</label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <FiCheck className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-transparent">
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
              <button
                onClick={() => insertFormatting('**', '**')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Bold"
              >
                <FiBold className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => insertFormatting('*', '*')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Italic"
              >
                <FiItalic className="h-4 w-4 text-gray-600" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                onClick={() => insertFormatting('- ', '')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Bullet List"
              >
                <FiList className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => insertFormatting('1. ', '')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Numbered List"
              >
                <FiAlignLeft className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={editedAnswer}
              onChange={(e) => setEditedAnswer(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 focus:outline-none resize-none"
              placeholder="Enter your answer..."
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Use ** for bold, * for italic, - for bullets, 1. for numbered lists
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            AI Rephrase
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g., Make it more concise, Add technical details, Use formal tone..."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleRephrase();
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                Press Enter
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleRephrase}
              disabled={rephraseAnswer.isPending || !instruction.trim()}
              className="bg-gradient-to-r from-brand-primary/5 to-purple-600/5 hover:from-brand-primary/10 hover:to-purple-600/10 border-brand-primary/20"
            >
              {rephraseAnswer.isPending ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  Rephrasing...
                </>
              ) : (
                <>
                  <FiZap className="mr-2 h-4 w-4 text-brand-primary" />
                  Rephrase
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border-2 ${getTrustColor()}`}>
              {getTrustScore(question.trust_score)}% confidence
            </span>
            {question.user_edited && (
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                Edited by user
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={updateAnswer.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={updateAnswer.isPending}
              className="bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-600 hover:to-brand-primary"
            >
              {updateAnswer.isPending ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}