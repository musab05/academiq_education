import React, { useState, useEffect } from 'react';
import { useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GripVertical, X } from 'lucide-react';
import SortableItem from './SortableItem';
import LessonItem from './LessonItem';
import ThreeDotMenu from './ThreeDotMenu';

const ChapterItem =({
  chapter,
  onTitleChange,
  onLessonChange,
  onAddLesson,
  onReorderLessons,
  onDeleteLesson,
  onDeleteChapter,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const [editing, setEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(chapter.title);

  useEffect(() => {
    setLocalTitle(chapter.title);
  }, [chapter.title]);

  return (
    <SortableItem id={chapter.id}>
      <div className="bg-white rounded mb-3 sm:mb-4 shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b p-3 gap-2 sm:gap-0">
          <div className="flex items-center gap-2 font-medium text-sm sm:text-base w-full sm:w-auto">
            <GripVertical size={16} />
            {editing ? (
              <input
                value={localTitle}
                onChange={e => setLocalTitle(e.target.value)}
                onBlur={() => {
                  onTitleChange(chapter.id, localTitle);
                  setEditing(false);
                }}
                className="bg-transparent focus:outline-none font-medium text-sm sm:text-base w-full"
                autoFocus
              />
            ) : (
              <span>{chapter.title}</span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              className="text-xs sm:text-sm px-2 py-1 rounded border text-blue-600 hover:bg-blue-50 tap-target"
              onClick={() => onAddLesson(chapter.id)}
            >
              + Add Lesson
            </button>
            {editing ? (
              <button onClick={() => setEditing(false)}>
                <X size={16} className="text-gray-500" />
              </button>
            ) : (
              <ThreeDotMenu
                onEdit={() => console.log('Edit chapter')}
                onRename={() => setEditing(true)}
                onDelete={() => onDeleteChapter(chapter.id)}
              />
            )}
          </div>
        </div>
        <div className="p-2 sm:p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;
              const oldIndex = chapter.children.findIndex(
                i => i.id === active.id
              );
              const newIndex = chapter.children.findIndex(
                i => i.id === over.id
              );
              onReorderLessons(chapter.id, oldIndex, newIndex);
            }}
          >
            <SortableContext
              items={chapter.children.map(l => l._id || l.id)}
              strategy={verticalListSortingStrategy}
            >
              {chapter.children.map(lesson => (
                <LessonItem
                  key={lesson._id || lesson.id}
                  lesson={lesson}
                  onChange={onLessonChange}
                  onDelete={onDeleteLesson}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </SortableItem>
  );
}

export default ChapterItem;