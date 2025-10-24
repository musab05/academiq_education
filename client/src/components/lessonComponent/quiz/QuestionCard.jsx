import React, { useState, useEffect } from 'react';
import { GripVertical, Trash2, Save, RotateCcw } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuestionOptions from './QuestionOptions';
import QuestionFeedback from './QuestionFeedback';

const QUESTION_TYPE_LABELS = {
  'single-select': 'Single Choice',
  'multi-select': 'Multiple Choice', 
  'true-false': 'True/False',
  'fill-blank': 'Fill in Blank',
  'essay': 'Essay'
};

const QuestionCard = ({ question, questionIndex, onUpdate, onDelete, onSave, onRevert }) => {
  const [localQuestion, setLocalQuestion] = useState(question);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });

  useEffect(() => {
    setLocalQuestion(question);
  }, [question.id]);

  const handleLocalUpdate = (questionId, updates) => {
    setLocalQuestion(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    if (onSave) {
      onUpdate(localQuestion.id, localQuestion);
      onSave(localQuestion);
    }
  };

  const handleRevert = () => {
    if (onRevert) {
      onRevert(question.id);
      setLocalQuestion(question);
    }
  };
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="group bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical size={16} className="text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900">Question {questionIndex + 1}</h4>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              {QUESTION_TYPE_LABELS[question.type] || question.type}
            </span>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Points:</label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => onUpdate(question.id, { points: parseInt(e.target.value) || 1 })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                min="1"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Save & Close
              </button>
              <button
                onClick={() => onDelete(question.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
          <textarea
            value={localQuestion.question}
            onChange={(e) => handleLocalUpdate(localQuestion.id, { question: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter your question here..."
            rows={3}
          />
        </div>

        <QuestionOptions question={localQuestion} onUpdate={handleLocalUpdate} />
        <QuestionFeedback question={localQuestion} onUpdate={handleLocalUpdate} />
      </div>
    </div>
  );
};

export default QuestionCard;