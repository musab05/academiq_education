import React from 'react';

const QUESTION_TYPES = [
  { value: 'single-select', label: 'Single Select' },
  { value: 'multi-select', label: 'Multi Select' },
  { value: 'true-false', label: 'True/False' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
  { value: 'essay', label: 'Essay' }
];

const QuestionTypeSelector = ({ question, onUpdate }) => {
  return (
    <select
      value={question.type}
      onChange={(e) => onUpdate(question.id, { type: e.target.value, options: ['Option 1', 'Option 2'], correctAnswers: [] })}
      className="px-3 py-1 border border-gray-300 rounded text-sm bg-white"
    >
      {QUESTION_TYPES.map(type => (
        <option key={type.value} value={type.value}>{type.label}</option>
      ))}
    </select>
  );
};

export default QuestionTypeSelector;