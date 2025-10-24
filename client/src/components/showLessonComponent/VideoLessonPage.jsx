import React from 'react';
import { FiPlay } from 'react-icons/fi';
import LessonLayout from './LessonLayout';

export function VideoLessonPage({ lesson }) {
  const titleMeta = { typeLabel: 'Video Lesson', title: lesson.title, sub: `Duration: ${lesson.duration || '-'}`, author: lesson.author, cta: 'Play' };
  return (
    <LessonLayout titleMeta={titleMeta}>
      <div>
        <div className="mt-2 bg-black rounded overflow-hidden shadow-sm">
          <div className="w-full h-56 md:h-80 flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white rounded-full p-3 text-black"><FiPlay size={20} /></div>
              <div className="text-sm">Video player placeholder</div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">{lesson.description}</div>
      </div>
    </LessonLayout>
  );
}