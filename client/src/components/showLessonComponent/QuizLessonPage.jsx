import React from 'react';
import LessonLayout from './LessonLayout';

export function QuizLessonPage({ lesson }) {
  const titleMeta = { typeLabel: 'Quiz', title: lesson.title, sub: `Questions: ${lesson.questions?.length || 0}`, author: lesson.author, cta: 'Start Quiz' };
  return (
    <LessonLayout titleMeta={titleMeta}>
      <div className="space-y-4">
        {lesson.questions.map((q, i) => (
          <div key={i} className="p-3 border rounded-md">
            <div className="font-medium text-sm">Q{i + 1}. {q.question}</div>
            <div className="mt-2 space-y-2 text-sm">
              {q.options.map((o, j) => (
                <label key={j} className="flex items-center gap-2">
                  <input type="radio" name={`q-${i}`} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button className="bg-orange-500 text-white px-4 py-2 rounded text-sm">Submit Quiz</button>
        </div>
      </div>
    </LessonLayout>
  );
}