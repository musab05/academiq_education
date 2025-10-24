import React, { useState, useRef, useEffect } from 'react';
import { Plus, Settings, ChevronDown, CheckCircle, List, ToggleLeft, Edit3, FileText } from 'lucide-react';
import QuizSettings from './QuizSettings';

const QUESTION_TYPES = [
  { value: 'single-select', label: 'Single Choice', icon: CheckCircle, description: 'One correct answer' },
  { value: 'multi-select', label: 'Multiple Choice', icon: List, description: 'Multiple correct answers' },
  { value: 'true-false', label: 'True/False', icon: ToggleLeft, description: 'True or false question' },
  { value: 'fill-blank', label: 'Fill in Blank', icon: Edit3, description: 'Text input answer' },
  { value: 'essay', label: 'Essay', icon: FileText, description: 'Long text answer' }
];

const QuizSidebar = ({ 
  searchTerm, 
  setSearchTerm, 
  addQuestion, 
  questions, 
  pagination, 
  showSettings, 
  setShowSettings, 
  quizSettings, 
  setQuizSettings,
  onPublish,
  onRevert
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddQuestion = (type) => {
    addQuestion(type);
    setShowDropdown(false);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
        />
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 mb-3 shadow-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} />
              <span className="font-medium">Add Question</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleAddQuestion(type.value)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <type.icon size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-3 px-1">
          <span className="font-medium">{questions.length}</span> of <span className="font-medium">{pagination.total}</span> questions
        </div>
        
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings size={16} className="text-gray-600" />
          <span className="font-medium text-gray-700">Quiz Settings</span>
        </button>
      </div>

      <QuizSettings 
        quizSettings={quizSettings}
        setQuizSettings={setQuizSettings}
        showSettings={showSettings}
      />
    </div>
  );
};

export default QuizSidebar;