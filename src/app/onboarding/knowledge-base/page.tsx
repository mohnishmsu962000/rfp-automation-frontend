'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { createApiClient } from '@/lib/api-client';
import { FiUpload, FiLoader, FiArrowRight } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setIsUploading(true);
    try {
      const apiClient = createApiClient(getToken);
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', 'PROPOSAL');

        await apiClient.post('/api/documents/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      toast.success('Documents uploaded successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to upload documents');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(139, 92, 246, 0.15) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }}></div>
      </div>

      <div className="absolute top-1/4 left-1/4">
        <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl rotate-12 opacity-50"></div>
      </div>
      <div className="absolute bottom-1/3 right-1/3">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">✓</div>
              <div className="w-16 h-0.5 bg-brand-primary"></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-medium">2</div>
          </div>
          
          <h1 className="text-4xl font-light mb-3 bg-gradient-to-r from-brand-primary via-purple-500 to-pink-500 bg-clip-text text-transparent text-center">
            Build Your Knowledge Base
          </h1>
          <p className="text-center text-gray-600 font-light">Upload documents to power your AI responses</p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-xl shadow-2xl border border-white/50 rounded-3xl p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Upload Documents</h2>
            <p className="text-sm text-gray-500 font-light">Add company documents, proposals, case studies, or any content you want AI to reference</p>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors mb-6 ${
              isDragActive
                ? 'border-brand-primary bg-purple-50'
                : 'border-gray-300 hover:border-brand-primary hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <FiUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-base text-gray-700 font-light mb-2">
              {isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to browse'}
            </p>
            <p className="text-sm text-gray-500 font-light">PDF, DOCX, or TXT files</p>
          </div>

          {files.length > 0 && (
            <div className="mb-6 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 font-light truncate flex-1">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-light ml-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleSkip}
              disabled={isUploading}
              className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-50 transition-all font-light text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip for now
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="flex-1 bg-gradient-to-r from-brand-primary to-purple-500 text-white py-4 rounded-xl hover:shadow-xl hover:shadow-purple-200 transition-all font-light text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <FiLoader className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  Continue
                  <FiArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}