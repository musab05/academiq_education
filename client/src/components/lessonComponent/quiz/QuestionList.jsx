import React, { useState } from 'react';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const QUESTION_TYPE_LABELS = {
  'single-select': 'Single',
  'multi-select': 'Multiple', 
  'true-false': 'T/F',
  'fill-blank': 'Fill',
  'essay': 'Essay'
};

const QuestionListItem = ({ question, questionIndex, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg mb-2 hover:shadow-sm transition-shadow">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical size={14} className="text-gray-400" />
      </div>
      
      <div className="w-8 text-sm text-gray-500 font-medium">
        {questionIndex + 1}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {question.question || 'Untitled Question'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {question.points} point{question.points !== 1 ? 's' : ''}
        </div>
      </div>
      
      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
        {QUESTION_TYPE_LABELS[question.type]}
      </span>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(question.id)}
          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={() => onDelete(question.id)}
          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const QuestionList = ({ questions, onEdit, onDelete }) => {
  return (
    <div className="space-y-2">
      {questions.map((question, index) => (
        <QuestionListItem
          key={`question-${question.id || question._id || index}`}
          question={question}
          questionIndex={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default QuestionList;