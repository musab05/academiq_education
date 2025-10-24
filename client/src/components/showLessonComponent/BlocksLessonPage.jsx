import React from 'react';
import LessonLayout from './LessonLayout';

export function BlocksLessonPage({ lesson }) {
  const titleMeta = { typeLabel: 'Blocks', title: lesson.title, sub: `Estimated: ${lesson.duration || '-'}`, author: lesson.author, cta: 'Mark Complete' };
  return (
    <LessonLayout titleMeta={titleMeta}>
      <div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {lesson.blocks.map((b, i) => (
            <div key={i} className="p-4 border rounded-md bg-white">
              <div className="text-sm font-medium">{b.heading}</div>
              <div className="text-xs text-gray-600 mt-2">{b.text}</div>
            </div>
          ))}
        </div>
      </div>
    </LessonLayout>
  );
}