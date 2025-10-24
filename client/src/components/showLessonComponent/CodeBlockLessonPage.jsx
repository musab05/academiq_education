import React from 'react';
import LessonLayout from './LessonLayout';

export function CodeBlockLessonPage({ lesson }) {
  const titleMeta = { typeLabel: 'Code', title: lesson.title, sub: `Language: ${lesson.language || 'JavaScript'}`, author: lesson.author, cta: 'Run (mock)' };
  return (
    <LessonLayout titleMeta={titleMeta}>
      <div>
        <div className="mt-3 bg-gray-900 text-white rounded-md p-4 font-mono text-sm overflow-auto">
          <pre>{lesson.code}</pre>
        </div>

        <div className="mt-3 flex gap-2">
          <button className="bg-white text-gray-800 px-3 py-2 rounded">Run (mock)</button>
          <button className="bg-gray-100 text-gray-800 px-3 py-2 rounded">Copy</button>
        </div>
      </div>
    </LessonLayout>
  );
}