'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useUpdateAnswer, useRephraseAnswer } from '@/hooks/useRFPs';
import { FiSave, FiX, FiZap, FiLoader } from 'react-icons/fi';
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Answer" size="xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-900">
            {question.question_text}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
          <textarea
            value={editedAnswer}
            onChange={(e) => setEditedAnswer(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
            placeholder="Enter your answer..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Instructions
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Make it more concise, Add technical details, Use formal tone..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRephrase();
                }
              }}
            />
            <Button
              variant="outline"
              onClick={handleRephrase}
              disabled={rephraseAnswer.isPending || !instruction.trim()}
            >
              {rephraseAnswer.isPending ? (
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FiZap className="mr-2 h-4 w-4" />
              )}
              Rephrase
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to rephrase with AI, or edit the answer manually
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${
              question.trust_score >= 0.7 
                ? 'bg-green-100 text-green-700'
                : question.trust_score >= 0.4
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {question.trust_score > 1 ? Math.min(Math.round(question.trust_score), 100) : Math.min(Math.round(question.trust_score * 100), 100)}% confidence
            </span>
            {question.user_edited && (
              <span className="text-gray-500">· Edited by user</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={updateAnswer.isPending}
            >
              <FiX className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={updateAnswer.isPending}
            >
              {updateAnswer.isPending ? (
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FiSave className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}