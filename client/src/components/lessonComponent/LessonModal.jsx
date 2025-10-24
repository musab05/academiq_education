import React from 'react';
import { X, FileText, Video, Blocks, FileCode, ListChecks, ClipboardList, File, Code } from 'lucide-react';

const LESSON_TYPES = [
  { label: 'Text', icon: FileText },
  { label: 'Video', icon: Video },
  { label: 'Blocks', icon: Blocks },
  { label: 'Scorm', icon: FileCode },
  { label: 'Quiz', icon: ListChecks },
  { label: 'Assignment', icon: ClipboardList },
  { label: 'Document', icon: File },
  { label: 'CodeBlock', icon: Code },
];

const LessonModal = ({ open, onClose, onSelect }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-3 right-3 sm:top-4 sm:right-4 tap-target" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 pr-8">Add Content</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {LESSON_TYPES.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className="flex flex-col items-center justify-center p-3 sm:p-4 border rounded hover:bg-gray-100 transition tap-target"
            >
              <Icon size={24} className="mb-2 sm:w-7 sm:h-7" />
              <span className="text-xs sm:text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 sm:mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-sm px-4 py-2 rounded hover:bg-gray-300 tap-target"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LessonModal;