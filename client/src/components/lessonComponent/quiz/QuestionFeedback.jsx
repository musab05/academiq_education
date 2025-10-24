import React from 'react';

const QuestionFeedback = ({ question, onUpdate }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Answer Feedback</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-green-600 font-medium mb-1">Correct Answer Feedback</label>
          <textarea
            value={question.correctFeedback || 'Correct! Well done.'}
            onChange={(e) => onUpdate(question.id, { correctFeedback: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Message shown for correct answers..."
            rows={2}
          />
        </div>
        <div>
          <label className="block text-xs text-red-600 font-medium mb-1">Incorrect Answer Feedback</label>
          <textarea
            value={question.incorrectFeedback || 'Incorrect. Please review the material and try again.'}
            onChange={(e) => onUpdate(question.id, { incorrectFeedback: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Message shown for incorrect answers..."
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionFeedback;