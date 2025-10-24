import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { lessonAPI, progressAPI } from '../../../services/api';
import LessonNavigation from '../LessonNavigation';

const TextLessonViewer = ({ lesson, onNextLesson, onPreviousLesson, hasNext, hasPrevious }) => {
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const contentRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const readingIntervalRef = useRef(null);

  useEffect(() => {
    if (lesson?._id) {
      fetchLessonData();
      startTimeRef.current = Date.now();
      markAsCompleted();
      
      // Track reading time
      readingIntervalRef.current = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
      }
    };
  }, [lesson?._id]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const response = await lessonAPI.getTextActivity(lesson._id);
      setLessonData(response.data.activity);
      
      const progressResponse = await progressAPI.getTextLessonProgress(lesson._id);
      if (progressResponse.data && progressResponse.data.isCompleted) {
        setIsCompleted(true);
        setReadingTime(progressResponse.data.readingTime || 0);
      }
    } catch (error) {
      console.error('Error fetching text lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async () => {
    try {
      const currentReadingTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      console.log('Marking text lesson as completed:', lesson._id, lesson.title);
      const response = await progressAPI.updateTextProgress(lesson._id, {
        scrollPosition: 100,
        readingTime: currentReadingTime || 1,
        isCompleted: true
      });
      console.log('Text lesson marked as completed, response:', response.data);
      setIsCompleted(true);
      window.dispatchEvent(new Event('lessonCompleted'));
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 lg:p-8"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
          {isCompleted && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              ✓ Completed
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            5 min read
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Text Lesson
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completed
            </span>
          )}
        </div>
      </div>

      <div ref={contentRef} className="prose prose-lg max-w-none">
        {lessonData?.sections && lessonData.sections.length > 0 ? (
          <div className="space-y-6">
            {lessonData.sections.map((section, index) => (
              <div key={index} dangerouslySetInnerHTML={{ __html: section.content }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
            <p className="text-gray-500">This lesson doesn't have any content yet.</p>
          </div>
        )}

        {lessonData?.tips && lessonData.tips.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
            <h4 className="text-blue-800 font-semibold mb-2">💡 Tips</h4>
            <ul className="text-blue-700 space-y-1">
              {lessonData.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {lessonData?.keyPoints && lessonData.keyPoints.length > 0 && (
          <>
            <h2>Key Points to Remember</h2>
            <ul>
              {lessonData.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </>
        )}

        {lessonData?.summary && (
          <>
            <h2>Summary</h2>
            <p>{lessonData.summary}</p>
          </>
        )}
      </div>

      <LessonNavigation 
        onNextLesson={onNextLesson}
        onPreviousLesson={onPreviousLesson}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </motion.div>
  );
};

export default TextLessonViewer;