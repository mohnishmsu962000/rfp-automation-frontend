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
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-semibold bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#C4B5FD] bg-clip-text text-transparent">
          Knowledge Base
        </h1>
        
        {stats && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <FiFile className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {stats.documents.used} / {stats.documents.limit}
            </span>
            <span className="text-xs text-gray-500">documents</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/knowledge-base/documents')}
          className={`group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
            isDocuments
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
              : 'bg-white text-gray-600 hover:text-brand-primary hover:bg-brand-tinted border border-gray-200'
          }`}
        >
          <FiFile className={`h-4 w-4 transition-transform duration-200 ${isDocuments ? 'scale-110' : ''}`} />
          Documents
          {isDocuments && (
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-50" />
          )}
        </button>

        <button
          onClick={() => router.push('/dashboard/knowledge-base/attributes')}
          className={`group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
            isAttributes
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
              : 'bg-white text-gray-600 hover:text-brand-primary hover:bg-brand-tinted border border-gray-200'
          }`}
        >
          <FiTag className={`h-4 w-4 transition-transform duration-200 ${isAttributes ? 'scale-110' : ''}`} />
          Attributes
          {isAttributes && (
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-50" />
          )}
        </button>
      </div>

      {children}
    </div>
  );
}