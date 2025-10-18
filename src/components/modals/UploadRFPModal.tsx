'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useUploadRFP } from '@/hooks/useRFPs';
import { FiUpload, FiX, FiFile } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface UploadRFPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadRFPModal({ isOpen, onClose }: UploadRFPModalProps) {
  const [rfpName, setRfpName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const uploadRFP = useUploadRFP();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      if (!rfpName) {
        setRfpName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !rfpName.trim()) {
      toast.error('Please provide both RFP name and file');
      return;
    }

    try {
      const result = await uploadRFP.mutateAsync({ file, rfpName: rfpName.trim() });
      toast.success(result.message || 'RFP uploaded successfully!');
      handleClose();
    } catch (error: unknown) {
      console.error('Error uploading RFP:', error);
      toast.error('Failed to upload RFP');
    }
  };

  const handleClose = () => {
    setRfpName('');
    setFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload RFP">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RFP Name
          </label>
          <input
            type="text"
            value={rfpName}
            onChange={(e) => setRfpName(e.target.value)}
            placeholder="e.g., Q1 2024 Cloud Services RFP"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RFP Document
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-brand-primary transition-colors">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="hidden"
              id="rfp-file-upload"
              required
            />
            <label
              htmlFor="rfp-file-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <FiFile className="h-8 w-8 text-brand-primary" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="ml-4 p-1 hover:bg-gray-100 rounded"
                  >
                    <FiX className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              ) : (
                <>
                  <FiUpload className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 10MB)</p>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Processing may take 1-3 minutes depending on document size. 
            You&apos;ll be able to review and edit all generated answers.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploadRFP.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={uploadRFP.isPending || !file || !rfpName.trim()}
          >
            {uploadRFP.isPending ? 'Uploading...' : 'Upload RFP'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}