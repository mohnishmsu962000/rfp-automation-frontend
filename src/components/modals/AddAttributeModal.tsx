'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { createApiClient } from '@/lib/api-client';
import { FiTag } from 'react-icons/fi';
import { toast } from 'sonner';
import { Attribute } from '@/types/models';

interface AddAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAttributeModal({ isOpen, onClose }: AddAttributeModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<Attribute['category']>('business');

  const addMutation = useMutation({
    mutationFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.post('/api/attributes/', {
        key,
        value,
        category,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Attribute added successfully');
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add attribute');
    },
  });

  const handleClose = () => {
    setKey('');
    setValue('');
    setCategory('business');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    addMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Attribute" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="e.g. Founded Year, Employee Count"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            disabled={addMutation.isPending}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 2015, 500+"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            disabled={addMutation.isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Attribute['category'])}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white"
            disabled={addMutation.isPending}
          >
            <option value="technical">Technical</option>
            <option value="compliance">Compliance</option>
            <option value="business">Business</option>
            <option value="product">Product</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={addMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={addMutation.isPending}
          >
            <FiTag className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
        </div>
      </form>
    </Modal>
  );
}