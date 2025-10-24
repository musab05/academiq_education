import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Loader, ChevronDown, Check, BookOpen } from 'lucide-react';
import { chatbotAPI, lessonAPI } from '../../services/api';

const QuizAIAssistant = ({ lessonId, courseId, questions, onQuestionsGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showLessonDropdown, setShowLessonDropdown] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [courseLessons, setCourseLessons] = useState([]);
  const difficultyRef = useRef(null);
  const typeRef = useRef(null);
  const lessonRef = useRef(null);

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const typeOptions = [
    { value: 'mixed', label: 'Mixed Types' },
    { value: 'single-select', label: 'Single Choice' },
    { value: 'multi-select', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'fill-blank', label: 'Fill in Blank' },
    { value: 'essay', label: 'Essay' }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (difficultyRef.current && !difficultyRef.current.contains(e.target)) {
        setShowDifficultyDropdown(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target)) {
        setShowTypeDropdown(false);
      }
      if (lessonRef.current && !lessonRef.current.contains(e.target)) {
        setShowLessonDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (courseId) {
      lessonAPI.getLessonsForCourse(courseId).then(res => {
        const lessons = res.data.lessons.filter(l => ['text', 'video', 'document'].includes(l.type));
        setCourseLessons(lessons);
      }).catch(err => console.error('Failed to load lessons:', err));
    }
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const res = await chatbotAPI.generateQuestions({
        prompt: prompt.trim(),
        lessonId: selectedLessons.length > 0 ? selectedLessons[0] : null,
        courseId,
        difficulty,
        questionType,
        questionCount,
        existingQuestions: questions.map(q => q.question)
      });

      onQuestionsGenerated(res.data.questions);
      setPrompt('');
      setIsOpen(false);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Failed to generate questions'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: ['0 0 20px rgba(168, 85, 247, 0.4)', '0 0 40px rgba(236, 72, 153, 0.6)', '0 0 20px rgba(168, 85, 247, 0.4)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-8 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">Academiq Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Lesson (Optional)</label>
                  <div ref={lessonRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setShowLessonDropdown(!showLessonDropdown)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white hover:border-orange-300 transition-colors flex items-center justify-between"
                      disabled={loading}
                    >
                      <span className="text-gray-700 truncate">
                        {selectedLessons.length > 0 
                          ? courseLessons.find(l => l._id === selectedLessons[0])?.title || 'Select lesson'
                          : 'No lesson (general questions)'}
                      </span>
                      <BookOpen className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    </button>
                    {showLessonDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLessons([]);
                            setShowLessonDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center justify-between transition-colors"
                        >
                          <span className="text-gray-700">No lesson (general)</span>
                          {selectedLessons.length === 0 && <Check className="w-4 h-4 text-orange-500" />}
                        </button>
                        {courseLessons.map(lesson => (
                          <button
                            key={lesson._id}
                            type="button"
                            onClick={() => {
                              setSelectedLessons([lesson._id]);
                              setShowLessonDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center justify-between transition-colors"
                          >
                            <span className="text-gray-700 truncate">{lesson.title}</span>
                            {selectedLessons.includes(lesson._id) && <Check className="w-4 h-4 text-orange-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the topic for quiz questions (e.g., 'JavaScript arrays and loops')..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows="3"
                  disabled={loading}
                />
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                    <div ref={typeRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                        className="w-full p-2 border border-gray-200 rounded-lg bg-white hover:border-orange-300 transition-colors flex items-center justify-between"
                        disabled={loading}
                      >
                        <span className="text-gray-700">{typeOptions.find(o => o.value === questionType)?.label}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showTypeDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {typeOptions.map(option => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setQuestionType(option.value);
                                setShowTypeDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center justify-between transition-colors"
                            >
                              <span className="text-gray-700">{option.label}</span>
                              {questionType === option.value && <Check className="w-4 h-4 text-orange-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                      <div ref={difficultyRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
                          className="w-full p-2 border border-gray-200 rounded-lg bg-white hover:border-orange-300 transition-colors flex items-center justify-between"
                          disabled={loading}
                        >
                          <span className="text-gray-700 capitalize">{difficulty}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDifficultyDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showDifficultyDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                            {difficultyOptions.map(option => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setDifficulty(option.value);
                                  setShowDifficultyDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center justify-between transition-colors"
                              >
                                <span className="text-gray-700">{option.label}</span>
                                {difficulty === option.value && <Check className="w-4 h-4 text-orange-500" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Generate Questions
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuizAIAssistant;
