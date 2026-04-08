import React from "react";
import { motion } from "framer-motion";
import TextLessonViewer from "./viewers/TextLessonViewer";
import VideoLessonViewer from "./viewers/VideoLessonViewer";
import QuizLessonViewer from "./viewers/QuizLessonViewer";
import DocumentLessonViewer from "./viewers/DocumentLessonViewer";
import AssignmentLessonViewer from "./viewers/AssignmentLessonViewer";
import ScormLessonViewer from "./viewers/ScormLessonViewer";
import BlockLessonViewer from "./viewers/BlockLessonViewer";

const LearningContent = ({
  lesson,
  sidebarOpen,
  onNextLesson,
  onPreviousLesson,
  hasNext,
  hasPrevious,
}) => {
  const renderLessonContent = () => {
    if (!lesson) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a lesson
            </h3>
            <p className="text-gray-500">
              Choose a lesson from the sidebar to start learning
            </p>
          </div>
        </div>
      );
    }

    const navigationProps = {
      onNextLesson,
      onPreviousLesson,
      hasNext,
      hasPrevious,
    };

    switch (lesson.type) {
      case "text":
        return (
          <TextLessonViewer
            key={lesson._id}
            lesson={lesson}
            {...navigationProps}
          />
        );
      case "video":
        return (
          <VideoLessonViewer
            key={lesson._id}
            lesson={lesson}
            {...navigationProps}
          />
        );
      case "quiz":
        return (
          <QuizLessonViewer
            key={lesson._id}
            lesson={lesson}
            {...navigationProps}
          />
        );
      case "document":
        return (
          <DocumentLessonViewer
            key={lesson._id}
            lesson={lesson}
            {...navigationProps}
          />
        );
      case "assignment":
        return (
          <AssignmentLessonViewer
            key={lesson._id}
            lesson={lesson}
            {...navigationProps}
          />
        );
      case "scorm":
        return (
          <ScormLessonViewer
            key={lesson._id}
            lesson={lesson}
            {...navigationProps}
          />
        );
      case "block":
      case "blocks":
        return (
          <BlockLessonViewer
            key={lesson._id}
            lesson={lesson}
            {...navigationProps}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Lesson type not supported
              </h3>
              <p className="text-gray-500">
                This lesson type is not yet implemented
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.main className="flex-1 bg-white" layout>
      <div className="h-full overflow-y-auto">{renderLessonContent()}</div>
    </motion.main>
  );
};

export default LearningContent;
