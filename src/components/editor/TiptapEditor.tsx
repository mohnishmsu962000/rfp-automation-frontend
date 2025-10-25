import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { useEffect } from 'react';
import { FiBold, FiItalic, FiList, FiCode } from 'react-icons/fi';

interface TiptapEditorProps {
  content: string;
  onChange: (text: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Markdown,
      Placeholder.configure({
        placeholder: 'Start typing your answer...',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-base max-w-none focus:outline-none min-h-[500px] px-6 py-4 text-gray-900',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bold') ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-gray-200'
          }`}
          type="button"
          title="Bold (Ctrl+B)"
        >
          <FiBold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('italic') ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-gray-200'
          }`}
          type="button"
          title="Italic (Ctrl+I)"
        >
          <FiItalic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('code') ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-gray-200'
          }`}
          type="button"
          title="Inline Code"
        >
          <FiCode className="h-4 w-4" />
        </button>
        <div className="w-px h-5 bg-gray-300 mx-2" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded transition-colors text-sm font-semibold ${
            editor.isActive('heading', { level: 2 }) ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-gray-200 text-gray-700'
          }`}
          type="button"
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded transition-colors text-sm font-semibold ${
            editor.isActive('heading', { level: 3 }) ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-gray-200 text-gray-700'
          }`}
          type="button"
          title="Heading 3"
        >
          H3
        </button>
        <div className="w-px h-5 bg-gray-300 mx-2" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bulletList') ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-gray-200'
          }`}
          type="button"
          title="Bullet List"
        >
          <FiList className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded transition-colors text-sm font-semibold ${
            editor.isActive('orderedList') ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-gray-200 text-gray-700'
          }`}
          type="button"
          title="Numbered List"
        >
          1.
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}