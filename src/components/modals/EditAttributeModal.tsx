'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { createApiClient } from '@/lib/api-client';
import { FiSave } from 'react-icons/fi';
import { toast } from 'sonner';
import { Attribute } from '@/types/models';

interface EditAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  attribute: Attribute;
}

export default function EditAttributeModal({ isOpen, onClose, attribute }: EditAttributeModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [key, setKey] = useState(attribute.key);
  const [value, setValue] = useState(attribute.value);
  const [category, setCategory] = useState<Attribute['category']>(attribute.category);

  useEffect(() => {
    setKey(attribute.key);
    setValue(attribute.value);
    setCategory(attribute.category);
  }, [attribute]);

  const editMutation = useMutation({
    mutationFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.patch(`/api/attributes/${attribute.id}`, {
        key,
        value,
        category,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Attribute updated successfully');
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      onClose();
    },
    onError: (error: unknown) => {
      console.error('Error updating attribute:', error);
      toast.error('Failed to update attribute');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    editMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Attribute" size="md">
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
            disabled={editMutation.isPending}
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
            disabled={editMutation.isPending}
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
            disabled={editMutation.isPending}
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
            onClick={onClose}
            disabled={editMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={editMutation.isPending}
          >
            <FiSave className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}