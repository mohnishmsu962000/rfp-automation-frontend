'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { createApiClient } from '@/lib/api-client';
import { FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'sonner';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadDocumentModal({ isOpen, onClose }: UploadDocumentModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<'proposal' | 'contract' | 'report' | 'presentation' | 'other'>('other');
  const [tags, setTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');

      const token = await getToken();
      console.log('Token:', token);
      
      const apiClient = createApiClient(getToken);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', docType.toUpperCase());
      formData.append('tags', tags);

      const { data } = await apiClient.post('/api/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(percentCompleted);
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['usage-stats'] });
      handleClose();
    },
    onError: (error: unknown) => {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      setUploadProgress(0);
    },
  });

  const handleClose = () => {
    setFile(null);
    setDocType('other');
    setTags('');
    setUploadProgress(0);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Document" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document File
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              id="file-upload"
              disabled={uploadMutation.isPending}
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-brand-primary transition-colors cursor-pointer bg-gray-50"
            >
              <div className="text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, DOC, DOCX, TXT up to 10MB
                </p>
              </div>
            </label>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="absolute top-2 right-2 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as 'proposal' | 'contract' | 'report' | 'presentation' | 'other')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white"
            disabled={uploadMutation.isPending}
          >
            <option value="proposal">Proposal</option>
            <option value="contract">Contract</option>
            <option value="report">Report</option>
            <option value="presentation">Presentation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. technical, product, 2024"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            disabled={uploadMutation.isPending}
          />
          <p className="mt-1 text-xs text-gray-500">
            Add relevant tags to help organize and find this document
          </p>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={uploadMutation.isPending}
            disabled={!file || uploadMutation.isPending}
          >
            <FiUpload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}