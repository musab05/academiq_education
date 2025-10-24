import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const TextEditor = ({ content, onChange, editorRef }) => {
  const localEditorRef = useRef(null);
  const actualEditorRef = editorRef || localEditorRef;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-4">
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        onInit={(evt, editor) => {
          actualEditorRef.current = editor;
          console.log('TinyMCE initialized successfully');
        }}
        value={content}
        onEditorChange={onChange}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'anchor', 'searchreplace', 'visualblocks', 'code',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | removeformat',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder: 'Start writing your lesson content...'
        }}
      />
    </div>
  );
};

export default TextEditor;
