'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { createApiClient } from '@/lib/api-client';
import { FiAlertCircle } from 'react-icons/fi';
import { toast } from 'sonner';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  itemId: string;
  endpoint: string;
  queryKey: string;
  successMessage: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  title,
  description,
  itemId,
  endpoint,
  queryKey,
  successMessage,
}: DeleteConfirmationModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const apiClient = createApiClient(getToken);
      await apiClient.delete(`${endpoint}/${itemId}`);
    },
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      if (queryKey === 'documents') {
        queryClient.invalidateQueries({ queryKey: ['usage-stats'] });
      }
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete');
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <FiAlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-gray-700">{description}</p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => deleteMutation.mutate()}
            isLoading={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}