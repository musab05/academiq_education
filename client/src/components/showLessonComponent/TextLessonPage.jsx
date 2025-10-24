import React from 'react';
import LessonLayout from './LessonLayout';

export function TextLessonPage({ lesson }) {
  const titleMeta = { typeLabel: 'Text Lesson', title: lesson.title, sub: `Estimated: ${lesson.duration || '-'}`, author: lesson.author, cta: 'Mark Complete' };
  return (
    <LessonLayout titleMeta={titleMeta}>
      <div className="prose max-w-none text-gray-800">
        <h2 className="text-xl font-semibold">{lesson.title}</h2>
        <p className="mt-3 text-sm leading-relaxed">{lesson.content}</p>

        {lesson.sections && lesson.sections.map((sec, idx) => (
          <section key={idx} className="mt-6">
            <h3 className="text-md font-semibold">{sec.heading}</h3>
            <p className="mt-2 text-sm text-gray-700">{sec.text}</p>
          </section>
        ))}

        <div className="mt-6 border-t pt-6">
          <div className="text-sm font-medium mb-2">Leave a comment</div>
          <textarea className="w-full p-3 border rounded h-28 resize-none" placeholder="Write your comment..."></textarea>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-400">You must be logged in to post a comment.</div>
            <button className="bg-orange-500 text-white px-4 py-2 rounded text-sm">Post Comment</button>
          </div>
        </div>
      </div>
    </LessonLayout>
  );
}