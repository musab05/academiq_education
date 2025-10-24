import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LeftLessonSidebar } from '../components/showLessonComponent/LeftLessonSidebar';
import { TextLessonPage } from '../components/showLessonComponent/TextLessonPage';
import { VideoLessonPage } from '../components/showLessonComponent/VideoLessonPage';
import { QuizLessonPage } from '../components/showLessonComponent/QuizLessonPage';
import { CodeBlockLessonPage } from '../components/showLessonComponent/CodeBlockLessonPage';
import { BlocksLessonPage } from '../components/showLessonComponent/BlocksLessonPage';
import { SCORMLessonPage } from '../components/showLessonComponent/SCORMLessonPage';
import { AssignmentLessonPage } from '../components/showLessonComponent/AssignmentLessonPage';
import { DocumentLessonPage } from '../components/showLessonComponent/DocumentLessonPage';

const LessonPages_All = ({ lessons = [], activeLesson = null, onLessonSelect = () => {} }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentActiveLesson, setCurrentActiveLesson] = useState(activeLesson);

  const handleLessonSelect = (lessonId) => {
    const selectedLesson = lessons.find(l => l.id === lessonId);
    setCurrentActiveLesson(selectedLesson);
    onLessonSelect(lessonId);
  };
  const renderLessonContent = () => {
    if (!currentActiveLesson) return <div className="text-center text-gray-500 py-8">Select a lesson to view content</div>;

    switch (currentActiveLesson.type?.toLowerCase()) {
      case 'text':
        return <TextLessonPage lesson={currentActiveLesson} />;
      case 'video':
        return <VideoLessonPage lesson={currentActiveLesson} />;
      case 'quiz':
        return <QuizLessonPage lesson={currentActiveLesson} />;
      case 'codeblock':
        return <CodeBlockLessonPage lesson={currentActiveLesson} />;
      case 'blocks':
        return <BlocksLessonPage lesson={currentActiveLesson} />;
      case 'scorm':
        return <SCORMLessonPage lesson={currentActiveLesson} />;
      case 'assignment':
        return <AssignmentLessonPage lesson={currentActiveLesson} />;
      case 'document':
        return <DocumentLessonPage lesson={currentActiveLesson} />;
      default:
        return <div className="text-center text-gray-500 py-8">Unknown lesson type: {currentActiveLesson.type}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-6">
        {/* Lesson Content */}
        <div className="flex-1">
          {renderLessonContent()}
        </div>
        
        {/* Collapsible Sidebar */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-12' : 'w-80'} flex-shrink-0`}>
          {sidebarCollapsed ? (
            <div className="bg-white rounded-lg shadow border p-3">
              <button 
                onClick={() => setSidebarCollapsed(false)}
                className="w-full flex justify-center p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setSidebarCollapsed(true)}
                className="absolute top-4 left-4 z-10 p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
              <LeftLessonSidebar 
                lessons={lessons} 
                activeId={currentActiveLesson?.id} 
                onSelect={handleLessonSelect} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPages_All;