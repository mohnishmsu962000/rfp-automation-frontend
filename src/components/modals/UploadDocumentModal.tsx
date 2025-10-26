'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { createApiClient } from '@/lib/api-client';
import { FiUpload, FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { toast } from 'sonner';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadDocumentModal({ isOpen, onClose }: UploadDocumentModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [docType, setDocType] = useState<'proposal' | 'contract' | 'report' | 'presentation' | 'other'>('other');
  const [tags, setTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{success: string[], failed: string[]}>({success: [], failed: []});

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (files.length === 0) throw new Error('No files selected');

      const token = await getToken();
      console.log('Token:', token);
      
      const apiClient = createApiClient(getToken);
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('files', file);
      });
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
    onSuccess: (data) => {
      const uploaded = data.uploaded || [];
      const failed = data.failed || [];
      
      setUploadResults({
        success: uploaded.map((u: {filename: string}) => u.filename),
        failed: failed.map((f: {filename: string}) => f.filename)
      });
    
      if (uploaded.length > 0) {
        toast.success(`${uploaded.length} document(s) uploaded successfully`);
      }
      if (failed.length > 0) {
        toast.error(`${failed.length} document(s) failed to upload`);
      }
    
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['usage-stats'] });
      
      if (failed.length === 0) {
        setTimeout(handleClose, 2000);
      }
    },
    onError: (error: unknown) => {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents');
      setUploadProgress(0);
    },
  });

  const handleClose = () => {
    setFiles([]);
    setDocType('other');
    setTags('');
    setUploadProgress(0);
    setUploadResults({success: [], failed: []});
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Documents" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Files
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              multiple
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
                  {files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload or drag and drop'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, DOC, DOCX, TXT up to 10MB (multiple files allowed)
                </p>
              </div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                  {uploadResults.success.includes(file.name) && (
                    <FiCheckCircle className="text-green-500 mr-2" />
                  )}
                  {uploadResults.failed.includes(file.name) && (
                    <FiXCircle className="text-red-500 mr-2" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={uploadMutation.isPending}
                    className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                  >
                    <FiX className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            Add relevant tags to help organize and find these documents
          </p>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading {files.length} file(s)...</span>
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
            disabled={files.length === 0 || uploadMutation.isPending}
          >
            <FiUpload className="mr-2 h-4 w-4" />
            Upload {files.length > 0 ? `${files.length} Document(s)` : 'Documents'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}