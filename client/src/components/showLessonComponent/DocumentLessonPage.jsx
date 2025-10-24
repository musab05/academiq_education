import React from 'react';
import { FiFile } from 'react-icons/fi';
import LessonLayout from './LessonLayout';

export function DocumentLessonPage({ lesson }) {
  const titleMeta = { typeLabel: 'Document', title: lesson.title, sub: `${lesson.filesize || '-'} • ${lesson.pages ? lesson.pages + ' pages' : ''}`, author: lesson.author, cta: 'Download' };
  return (
    <LessonLayout titleMeta={titleMeta}>
      <div className="p-4 bg-white border rounded">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded"><FiFile size={18} /></div>
          <div>
            <div className="font-medium">{lesson.filename}</div>
            <div className="text-xs text-gray-500">{lesson.filesize}</div>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="bg-blue-500 text-white px-3 py-2 rounded text-sm">View PDF</button>
            <button className="bg-orange-500 text-white px-3 py-2 rounded text-sm">Download</button>
          </div>
        </div>
      </div>
    </LessonLayout>
  );
}