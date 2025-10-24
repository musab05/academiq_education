import React from 'react';
import LessonLayout from './LessonLayout';

export function AssignmentLessonPage({ lesson }) {
  const titleMeta = { typeLabel: 'Assignment', title: lesson.title, sub: `Due: ${lesson.due || 'N/A'}`, author: lesson.author, cta: 'Submit' };
  return (
    <LessonLayout titleMeta={titleMeta}>
      <div className="p-4 bg-white border rounded">
        <div className="text-sm text-gray-700">{lesson.description}</div>

        <div className="mt-4">
          <label className="block text-xs text-gray-500">Upload your solution</label>
          <input type="file" className="mt-2" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button className="bg-orange-500 text-white px-4 py-2 rounded text-sm">Submit Assignment</button>
          <div className="text-xs text-gray-500">Due: {lesson.due}</div>
        </div>
      </div>
    </LessonLayout>
  );
}