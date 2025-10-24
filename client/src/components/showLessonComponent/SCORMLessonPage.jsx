import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import LessonLayout from './LessonLayout';

export function SCORMLessonPage({ lesson }) {
  const titleMeta = { typeLabel: 'SCORM Module', title: lesson.title, sub: `Status: ${lesson.status || 'Not started'}`, author: lesson.author, cta: 'Launch' };
  return (
    <LessonLayout titleMeta={titleMeta}>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="p-6 bg-gray-50 rounded border flex flex-col gap-4">
          <div className="text-sm text-gray-600">{lesson.description}</div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">Status</div>
            <div className="text-xs text-gray-500">{lesson.status || 'Not started'}</div>
          </div>

          <div className="mt-4">
            <button className="bg-orange-500 text-white px-4 py-2 rounded-md shadow">Launch SCORM</button>
          </div>
        </div>

        <div className="p-6 bg-white rounded border">
          <div className="text-sm font-medium">Progress</div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div style={{ width: `${lesson.progress ?? 0}%` }} className="h-3 bg-orange-500"></div>
            </div>
            <div className="text-xs text-gray-400 mt-2">{lesson.progress ?? 0}% complete</div>
            <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
              <FiCheckCircle /> SCORM results saved to profile.
            </div>
          </div>
        </div>
      </div>
    </LessonLayout>
  );
}