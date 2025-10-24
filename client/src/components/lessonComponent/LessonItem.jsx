import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Video, Blocks, FileCode, ListChecks, ClipboardList, File, Code, GripVertical, X } from 'lucide-react';
import SortableItem from './SortableItem';
import ThreeDotMenu from './ThreeDotMenu';

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

const LessonItem = ({ lesson, onChange, onDelete }) => {
  const navigate = useNavigate();
  const Icon = LESSON_TYPES.find(lt => lt.label === lesson.type)?.icon;
  const [editing, setEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(lesson.title);

  const handleEditContent = () => {
    const lessonId = lesson._id || lesson.id;
    if (lesson.type === 'text') {
      navigate(`/text-lesson/${lessonId}`);
    } else if (lesson.type === 'video') {
      navigate(`/video-lesson/${lessonId}`);
    } else if (lesson.type === 'blocks') {
      navigate(`/block-lesson/${lessonId}`);
    } else if (lesson.type === 'scorm') {
      navigate(`/scorm-lesson/${lessonId}`);
    } else if (lesson.type === 'quiz') {
      navigate(`/quiz-lesson/${lessonId}`);
    } else if (lesson.type === 'assignment') {
      navigate(`/assignment-lesson/${lessonId}`);
    } else if (lesson.type === 'document') {
      navigate(`/document-lesson/${lessonId}`);
    }
  };

  useEffect(() => {
    setLocalTitle(lesson.title);
  }, [lesson.title]);

  return (
    <SortableItem id={lesson._id || lesson.id}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-2 sm:p-3 rounded border mb-2 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 flex-grow w-full sm:w-auto">
          <GripVertical size={14} className="text-gray-400 sm:w-4 sm:h-4" />
          {Icon && <Icon size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />}
          {editing ? (
            <input
              value={localTitle}
              onChange={e => setLocalTitle(e.target.value)}
              onBlur={() => {
                onChange(lesson._id || lesson.id, localTitle);
                setEditing(false);
              }}
              className="bg-transparent focus:outline-none text-xs sm:text-sm w-full"
              autoFocus
            />
          ) : (
            <span className="text-xs sm:text-sm flex-grow">{lesson.title}</span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={handleEditContent}
            className="text-xs border text-blue-600 px-2 py-1 rounded hover:bg-blue-50 tap-target"
          >
            Edit Content
          </button>
          {editing ? (
            <button onClick={() => setEditing(false)}>
              <X size={16} className="text-gray-500" />
            </button>
          ) : (
            <ThreeDotMenu
              onEdit={() => console.log('Edit clicked')}
              onRename={() => setEditing(true)}
              onDelete={() => onDelete(lesson._id || lesson.id)}
            />
          )}
        </div>
      </div>
    </SortableItem>
  );
}

export default LessonItem;