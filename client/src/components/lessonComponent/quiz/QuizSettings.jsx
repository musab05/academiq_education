import React from 'react';

const QuizSettings = ({ quizSettings, setQuizSettings, showSettings }) => {
  if (!showSettings) return null;

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time Limit (minutes)
        </label>
        <input
          type="number"
          value={quizSettings.timeLimit || ''}
          onChange={(e) => setQuizSettings({...quizSettings, timeLimit: e.target.value ? parseInt(e.target.value) : null})}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          placeholder="No limit"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Passing Score (%)
        </label>
        <input
          type="number"
          value={quizSettings.passingScore}
          onChange={(e) => setQuizSettings({...quizSettings, passingScore: parseInt(e.target.value) || 70})}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          min="0"
          max="100"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max Attempts
        </label>
        <input
          type="number"
          value={quizSettings.maxAttempts}
          onChange={(e) => setQuizSettings({...quizSettings, maxAttempts: parseInt(e.target.value) || 1})}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          min="1"
        />
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={quizSettings.allowRetakes}
            onChange={(e) => setQuizSettings({...quizSettings, allowRetakes: e.target.checked})}
            className="rounded"
          />
          <span className="text-sm">Allow Retakes</span>
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={quizSettings.shuffleQuestions}
            onChange={(e) => setQuizSettings({...quizSettings, shuffleQuestions: e.target.checked})}
            className="rounded"
          />
          <span className="text-sm">Shuffle Questions</span>
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={quizSettings.shuffleOptions}
            onChange={(e) => setQuizSettings({...quizSettings, shuffleOptions: e.target.checked})}
            className="rounded"
          />
          <span className="text-sm">Shuffle Options</span>
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={quizSettings.showResults}
            onChange={(e) => setQuizSettings({...quizSettings, showResults: e.target.checked})}
            className="rounded"
          />
          <span className="text-sm">Show Results</span>
        </label>
      </div>
    </div>
  );
};

export default QuizSettings;