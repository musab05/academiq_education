import React from 'react';
import { FiPlay, FiFileText, FiCode } from 'react-icons/fi';
import { MdOutlineQuiz } from 'react-icons/md';

export function LeftLessonSidebar({ lessons = [], activeId, onSelect }) {
  return (
    <aside className="w-full md:w-80">
      <div className="sticky top-6">
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Lessons</div>
            <div className="text-xs text-gray-400">{lessons.length}</div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-96" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {lessons.map((l, i) => {
              const progress = l.progress ?? 0;
              const active = l.id === activeId;
              return (
                <button
                  key={l.id}
                  onClick={() => onSelect(l.id)}
                  className={`w-full text-left p-3 rounded-md flex items-start gap-3 transition-shadow duration-150 ${active ? 'bg-white shadow-lg border' : 'bg-gray-50 hover:bg-white'
                    }`}>
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-orange-500 text-lg">
                    {l.type === 'Video' ? <FiPlay /> : l.type === 'Quiz' ? <MdOutlineQuiz /> : l.type === 'CodeBlock' ? <FiCode /> : <FiFileText />}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-medium">{l.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{l.type} • {l.duration || l.filesize || '-'}</div>

                    {active && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div style={{ width: `${progress}%` }} className="h-2 bg-orange-500"></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{progress}% complete</div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-400 ml-2">{i + 1}</div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </aside>
  );
}