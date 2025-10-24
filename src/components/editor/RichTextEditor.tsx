'use client';

import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('./TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="h-8" />
      </div>
      <div className="min-h-[500px] px-6 py-4 text-gray-400">
        Loading editor...
      </div>
    </div>
  ),
});

interface RichTextEditorProps {
  content: string;
  onChange: (text: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  return <TiptapEditor content={content} onChange={onChange} />;
}