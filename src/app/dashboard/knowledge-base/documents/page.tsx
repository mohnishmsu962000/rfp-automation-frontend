'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import UploadDocumentModal from '@/components/modals/UploadDocumentModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { useDocuments } from '@/hooks/useDocuments';
import { FiFile, FiUpload, FiLoader, FiTrash2, FiSearch, FiChevronDown, FiFileText, FiImage } from 'react-icons/fi';
import { format } from 'date-fns';

type SortOption = 'newest' | 'oldest' | 'name' | 'size';

const FILE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FiFileText,
  doc: FiFileText,
  docx: FiFileText,
  txt: FiFileText,
  jpg: FiImage,
  jpeg: FiImage,
  png: FiImage,
  default: FiFile,
};

export default function DocumentsPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const { data: documents, isLoading } = useDocuments();

  const filteredAndSortedDocs = useMemo(() => {
    if (!documents) return [];

    const filtered = documents.filter(doc =>
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
        case 'oldest':
          return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
        case 'name':
          return a.filename.localeCompare(b.filename);
        case 'size':
          return (b.file_size || 0) - (a.file_size || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, sortBy]);

  const getFileIcon = (filename: string): React.ComponentType<{ className?: string }> => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Documents
            </h1>
            <p className="text-gray-600 mt-2">Upload and manage your knowledge base documents</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-600 hover:to-brand-primary shadow-lg"
          >
            <FiUpload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors cursor-pointer text-sm font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Largest First</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {isLoading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12">
              <FiLoader className="h-8 w-8 text-brand-primary animate-spin" />
            </div>
          </Card>
        ) : filteredAndSortedDocs.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={<FiFile className="h-12 w-12" />}
              title={searchQuery ? 'No documents found' : 'No documents yet'}
              description={
                searchQuery
                  ? 'Try adjusting your search'
                  : 'Upload documents to build your knowledge base. Supported formats: PDF, DOCX, TXT, and images.'
              }
              action={
                !searchQuery ? (
                  <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
                    <FiUpload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">File Name</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Size</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Status</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">Uploaded</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedDocs.map((doc) => {
                  const FileIcon = getFileIcon(doc.filename);

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <FileIcon className="h-5 w-5 text-brand-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">{doc.filename}</p>
                            <p className="text-xs text-gray-500">
                              {doc.filename.split('.').pop()?.toUpperCase()} file
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-gray-600">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-green-50 border-green-200 text-green-700">
                          Processed
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-gray-600">
                        {doc.uploaded_at ? format(new Date(doc.uploaded_at), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <button
                            onClick={() => setDeletingDocument(doc)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          >
                            <FiTrash2 className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {deletingDocument && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeletingDocument(null)}
          title="Delete Document"
          description={`Are you sure you want to delete "${deletingDocument.filename}"? This action cannot be undone.`}
          itemId={deletingDocument.id}
          endpoint="/api/documents"
          queryKey="documents"
          successMessage="Document deleted successfully"
        />
      )}
    </>
  );
}