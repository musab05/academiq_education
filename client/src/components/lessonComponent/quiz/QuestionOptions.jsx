import React from 'react';
import { Trash2 } from 'lucide-react';

const QuestionOptions = ({ question, onUpdate }) => {
  const addOption = () => {
    const currentOptions = question.options || [];
    const newOptionNumber = currentOptions.length + 1;
    const newOptions = [...currentOptions, `Option ${newOptionNumber}`];
    onUpdate(question.id, { options: newOptions });
  };

  const updateOption = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    onUpdate(question.id, { options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    onUpdate(question.id, { options: newOptions });
  };

  const toggleCorrectAnswer = (option) => {
    if (question.type === 'single-select') {
      onUpdate(question.id, { correctAnswers: [option] });
    } else if (question.type === 'multi-select') {
      const current = question.correctAnswers || [];
      const updated = current.includes(option)
        ? current.filter(a => a !== option)
        : [...current, option];
      onUpdate(question.id, { correctAnswers: updated });
    }
  };

  if (question.type === 'single-select' || question.type === 'multi-select') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
        <div className="space-y-3">
          {(question.options || []).map((option, index) => (
            <div key={`${question.id}-option-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <input
                type={question.type === 'single-select' ? 'radio' : 'checkbox'}
                name={`correct-${question.id}`}
                checked={question.correctAnswers?.includes(option)}
                onChange={() => toggleCorrectAnswer(option)}
                className="text-green-600 w-4 h-4"
              />
              <span className="text-sm text-gray-600 w-8">{String.fromCharCode(65 + index)}.</span>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder={`Enter option ${index + 1}`}
              />
              <button
                onClick={() => removeOption(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            + Add Another Option
          </button>
        </div>
      </div>
    );
  }

  if (question.type === 'true-false') {
    return (
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`correct-${question.id}`}
            checked={question.correctAnswers?.[0] === 'true'}
            onChange={() => onUpdate(question.id, { correctAnswers: ['true'] })}
            className="text-green-600"
          />
          True
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`correct-${question.id}`}
            checked={question.correctAnswers?.[0] === 'false'}
            onChange={() => onUpdate(question.id, { correctAnswers: ['false'] })}
            className="text-green-600"
          />
          False
        </label>
      </div>
    );
  }

  if (question.type === 'fill-blank') {
    return (
      <input
        type="text"
        value={question.correctAnswers?.[0] || ''}
        onChange={(e) => onUpdate(question.id, { correctAnswers: [e.target.value] })}
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        placeholder="Correct answer..."
      />
    );
  }

  return null;
};

export default QuestionOptions;