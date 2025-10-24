import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scorm12API, Scorm2004API } from 'scorm-again';
import { lessonAPI, progressAPI } from '../../../services/api';
import LessonNavigation from '../LessonNavigation';

const ScormLessonViewer = ({
  lesson,
  onNextLesson,
  onPreviousLesson,
  hasNext,
  hasPrevious,
  onProgressUpdate,
}) => {
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const iframeRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);

  useEffect(() => {
    if (lesson?._id) {
      initializeScorm();
    }
    
    return () => {
      // Save on unmount (only if initialized)
      if (window.API?.isInitialized()) {
        window.API.LMSCommit('');
      }
      if (window.API_1484_11?.isInitialized()) {
        window.API_1484_11.Commit('');
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [lesson?._id]);

  const initializeScorm = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await lessonAPI.getScormActivity(lesson._id);
      const activityData = response.data.activity;

      if (!activityData?.packageUrl) {
        throw new Error('No SCORM package found');
      }

      setLessonData(activityData);
      const sessionData = await progressAPI.initializeScormSession(lesson._id);

      // Initialize scorm-again APIs
      const scorm12 = new Scorm12API();
      const scorm2004 = new Scorm2004API();

      // Load ALL saved CMI data
      if (sessionData.data?.cmiData) {
        Object.entries(sessionData.data.cmiData).forEach(([key, value]) => {
          try {
            const parts = key.split('.');
            if (key.startsWith('cmi.core.')) {
              // SCORM 1.2
              const field = parts.slice(2).join('.');
              if (field === 'lesson_status') scorm12.cmi.core.lesson_status = value;
              else if (field === 'score.raw') scorm12.cmi.core.score.raw = value;
              else if (field === 'score.min') scorm12.cmi.core.score.min = value;
              else if (field === 'score.max') scorm12.cmi.core.score.max = value;
              else if (field === 'lesson_location') scorm12.cmi.core.lesson_location = value;
              else if (field === 'total_time') scorm12.cmi.core.total_time = value;
              else if (field === 'session_time') scorm12.cmi.core.session_time = value;
            } else if (key === 'cmi.suspend_data') {
              scorm12.cmi.suspend_data = value;
              scorm2004.cmi.suspend_data = value;
            } else if (key.startsWith('cmi.') && !key.startsWith('cmi.core.')) {
              // SCORM 2004
              const field = parts.slice(1).join('.');
              if (field === 'completion_status') scorm2004.cmi.completion_status = value;
              else if (field === 'success_status') scorm2004.cmi.success_status = value;
              else if (field === 'location') scorm2004.cmi.location = value;
              else if (field === 'score.raw') scorm2004.cmi.score.raw = value;
              else if (field === 'score.min') scorm2004.cmi.score.min = value;
              else if (field === 'score.max') scorm2004.cmi.score.max = value;
              else if (field === 'score.scaled') scorm2004.cmi.score.scaled = value;
              else if (field === 'progress_measure') scorm2004.cmi.progress_measure = value;
            }
          } catch (e) {
            console.error('Error loading CMI field:', key, e);
          }
        });
        updateLocalProgress({cmi: scorm12.cmi.core?.lesson_status ? scorm12.cmi : scorm2004.cmi});
      }

      // Override GetValue for SCORM 1.2
      const originalGetValue12 = scorm12.LMSGetValue.bind(scorm12);
      scorm12.LMSGetValue = (element) => {
        return originalGetValue12(element);
      };

      // Override SetValue for SCORM 1.2
      const originalSetValue12 = scorm12.LMSSetValue.bind(scorm12);
      scorm12.LMSSetValue = (element, value) => {
        const result = originalSetValue12(element, value);
        progressAPI.setScormCMIValue(lesson._id, element, value).then(() => {
          if (element === 'cmi.core.lesson_status' && ['completed', 'passed'].includes(value)) {
            progressAPI.commitScormData(lesson._id).then(() => {
              updateLocalProgress({cmi: scorm12.cmi});
              if (onProgressUpdate) onProgressUpdate();
            });
          }
        }).catch(console.error);
        updateLocalProgress({cmi: scorm12.cmi});
        return result;
      };

      const originalCommit12 = scorm12.LMSCommit.bind(scorm12);
      scorm12.LMSCommit = () => {
        const result = originalCommit12();
        
        const savePromises = [
          progressAPI.setScormCMIValue(lesson._id, 'cmi.core.lesson_status', scorm12.cmi.core.lesson_status),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.core.score.raw', scorm12.cmi.core.score.raw),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.core.score.min', scorm12.cmi.core.score.min),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.core.score.max', scorm12.cmi.core.score.max),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.core.lesson_location', scorm12.cmi.core.lesson_location),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.suspend_data', scorm12.cmi.suspend_data)
        ];
        
        Promise.all(savePromises).then(() => {
          return progressAPI.commitScormData(lesson._id);
        }).then(() => {
          updateLocalProgress({cmi: scorm12.cmi});
          if (onProgressUpdate) onProgressUpdate();
          window.dispatchEvent(new CustomEvent('scormProgressUpdate'));
        }).catch(console.error);
        return result;
      };

      // Override SetValue for SCORM 2004
      const originalSetValue2004 = scorm2004.SetValue.bind(scorm2004);
      scorm2004.SetValue = (element, value) => {
        const result = originalSetValue2004(element, value);
        progressAPI.setScormCMIValue(lesson._id, element, value).then(() => {
          if (element === 'cmi.completion_status' && value === 'completed') {
            progressAPI.commitScormData(lesson._id).then(() => {
              updateLocalProgress({cmi: scorm2004.cmi});
              if (onProgressUpdate) onProgressUpdate();
            });
          }
        }).catch(console.error);
        updateLocalProgress({cmi: scorm2004.cmi});
        return result;
      };

      const originalCommit2004 = scorm2004.Commit.bind(scorm2004);
      scorm2004.Commit = () => {
        const result = originalCommit2004();
        
        const savePromises = [
          progressAPI.setScormCMIValue(lesson._id, 'cmi.completion_status', scorm2004.cmi.completion_status),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.success_status', scorm2004.cmi.success_status),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.location', scorm2004.cmi.location),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.score.raw', scorm2004.cmi.score.raw),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.score.scaled', scorm2004.cmi.score.scaled),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.progress_measure', scorm2004.cmi.progress_measure),
          progressAPI.setScormCMIValue(lesson._id, 'cmi.suspend_data', scorm2004.cmi.suspend_data)
        ];
        
        Promise.all(savePromises).then(() => {
          return progressAPI.commitScormData(lesson._id);
        }).then(() => {
          updateLocalProgress({cmi: scorm2004.cmi});
          if (onProgressUpdate) onProgressUpdate();
          window.dispatchEvent(new CustomEvent('scormProgressUpdate'));
        }).catch(console.error);
        return result;
      };

      window.API = scorm12;
      window.API_1484_11 = scorm2004;
      
      // Auto-save every 10 seconds (only if initialized)
      autoSaveIntervalRef.current = setInterval(() => {
        if (scorm12.isInitialized()) {
          scorm12.LMSCommit('');
        }
        if (scorm2004.isInitialized()) {
          scorm2004.Commit('');
        }
      }, 10000);
      
      // Save on page unload (only if initialized)
      const handleBeforeUnload = () => {
        if (scorm12.isInitialized()) {
          scorm12.LMSCommit('');
        }
        if (scorm2004.isInitialized()) {
          scorm2004.Commit('');
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalProgress = (data) => {
    const cmi = data?.cmi || {};
    let newProgress = progress;
    let completed = isCompleted;
    
    if (cmi.core?.lesson_status) {
      const status = cmi.core.lesson_status;
      if (status === 'completed' || status === 'passed') {
        completed = true;
        newProgress = 100;
      } else if (status === 'incomplete') {
        completed = false;
      }
    }

    if (cmi.completion_status === 'completed' || cmi.success_status === 'passed') {
      completed = true;
      newProgress = 100;
    }

    if (cmi.progress_measure) {
      newProgress = parseFloat(cmi.progress_measure) * 100;
    }

    const score = cmi.score?.raw || cmi.core?.score?.raw;
    if (score !== undefined && score !== '' && score !== '0') {
      const scoreValue = parseFloat(score);
      if (!isNaN(scoreValue) && scoreValue > 0) {
        newProgress = scoreValue;
      }
    }

    setProgress(newProgress);
    setIsCompleted(completed);
    
    if (completed && !isCompleted) {
      window.dispatchEvent(new CustomEvent('lessonCompleted'));
    }
  };

  const handleIframeLoad = async () => {
    if (!lessonData) return;

    try {
      // Inject API into iframe
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.API = window.API;
        iframeRef.current.contentWindow.API_1484_11 = window.API_1484_11;
      }

      const progressResponse = await progressAPI.getScormLessonProgress(lesson._id);
      if (progressResponse.data) {
        setIsCompleted(progressResponse.data.isCompleted || false);
        setProgress(progressResponse.data.progress || 0);
      }
    } catch (error) {
      console.error('Error loading existing progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SCORM content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading SCORM Content</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!lessonData?.launchUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No SCORM Content</h3>
          <p className="text-gray-500">This lesson doesn't have SCORM content available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-white"
    >
      {progress > 0 && (
        <div className="bg-gray-100 p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {isCompleted && (
            <div className="mt-2 flex items-center text-green-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={lessonData.launchUrl.replace('http://localhost:3000', '')}
          className="w-full h-full border-0"
          title={lessonData.title || 'SCORM Content'}
          onLoad={handleIframeLoad}
        />
      </div>

      <div className="border-t bg-gray-50 p-4">
        <LessonNavigation
          onNextLesson={onNextLesson}
          onPreviousLesson={onPreviousLesson}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      </div>
    </motion.div>
  );
};

export default ScormLessonViewer;
