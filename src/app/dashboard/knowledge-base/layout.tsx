'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FiFile, FiTag } from 'react-icons/fi';
import { useUsageStats } from '@/hooks/useStats';

export default function KnowledgeBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: stats } = useUsageStats();

  const isDocuments = pathname.includes('/documents');
  const isAttributes = pathname.includes('/attributes');

  return (
    <div className="p-8 px-16 space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-5xl md:text-3xl font-medium mb-3 bg-gradient-to-r from-brand-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Knowledge Base
        </h1>
        
        {stats && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <FiFile className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {stats.docs.used} / {stats.docs.limit}
            </span>
            <span className="text-xs text-gray-500">documents</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-8 border-b border-gray-200">
        <button
          onClick={() => router.push('/dashboard/knowledge-base/documents')}
          className={`flex items-center gap-2 px-1 py-3 text-sm font-medium transition-colors relative ${
            isDocuments
              ? 'text-brand-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiFile className="h-4 w-4" />
          <span>Documents</span>
          {isDocuments && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"></div>
          )}
        </button>

        <button
          onClick={() => router.push('/dashboard/knowledge-base/attributes')}
          className={`flex items-center gap-2 px-1 py-3 text-sm font-medium transition-colors relative ${
            isAttributes
              ? 'text-brand-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiTag className="h-4 w-4" />
          <span>Attributes</span>
          {isAttributes && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"></div>
          )}
        </button>
      </div>

      {children}
    </div>
  );
}