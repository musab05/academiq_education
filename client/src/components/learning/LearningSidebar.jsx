import React, { useState, useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlay,
  FiCheck,
  FiDownload,
  FiLock,
  FiChevronDown,
  FiChevronUp,
  FiPaperclip,
} from "react-icons/fi";
import { MdOutlineQuiz } from "react-icons/md";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const LearningSidebar = ({
  open,
  lessons,
  chapters,
  currentLesson,
  progress,
  progressUpdateTrigger,
  onLessonSelect,
}) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const { courseId } = useParams();
  const { showNotification } = useNotification();
  const [courseSettings, setCourseSettings] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedResources, setExpandedResources] = useState({});

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const toggleResources = (lessonId) => {
    setExpandedResources((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseSettings();
    }
  }, [courseId]);

  useEffect(() => {
    // Expand chapter containing current lesson
    if (currentLesson?.chapter?._id) {
      setExpandedChapters((prev) => ({
        ...prev,
        [currentLesson.chapter._id]: true,
      }));
    }
  }, [currentLesson]);

  const progressHash = JSON.stringify(progress);

  useEffect(() => {
    forceUpdate();
  }, [progressUpdateTrigger, progressHash]);

  const fetchCourseSettings = async () => {
    try {
      const response = await api.get(`/api/courses/${courseId}`);
      setCourseSettings(response.data);
    } catch (error) {
      console.error("Error fetching course settings:", error);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/api/certificates/download/${courseId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${courseId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification({
        type: "success",
        message: "Certificate downloaded successfully!",
      });
    } catch (error) {
      showNotification({
        type: "error",
        message: "Failed to download certificate",
      });
    } finally {
      setDownloading(false);
    }
  };
  const getIcon = (type) => {
    switch (type) {
      case "video":
        return <FiPlay className="w-4 h-4 text-orange-500" />;
      case "quiz":
        return <MdOutlineQuiz className="w-4 h-4 text-orange-600" />;
      case "text":
        return (
          <svg
            className="w-4 h-4 text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "document":
        return (
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      case "assignment":
        return (
          <svg
            className="w-4 h-4 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      case "block":
      case "blocks":
        return (
          <svg
            className="w-4 h-4 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        );
      case "scorm":
        return (
          <svg
            className="w-4 h-4 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4 text-gray-500"
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
        );
    }
  };

  const getProgressCircle = (lessonId) => {
    const lessonProgress = progress[lessonId];
    if (!lessonProgress) return null;

    if (lessonProgress.status === "completed") {
      return (
        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <FiCheck className="w-3 h-3 text-white" />
        </div>
      );
    }

    if (lessonProgress.status === "in_progress") {
      const progressPercent = lessonProgress.progress || 0;
      const circumference = 2 * Math.PI * 10;
      const dashArray = (progressPercent / 100) * circumference;
      return (
        <div className="relative w-6 h-6">
          <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${dashArray} ${circumference}`}
              className="text-orange-500"
            />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
    );
  };

  const calculateOverallProgress = () => {
    if (!lessons.length) return 0;
    const completedLessons = lessons.filter(
      (lesson) => progress[lesson._id]?.status === "completed",
    ).length;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  const calculateChapterProgress = (chapterLessons) => {
    if (!chapterLessons.length) return 0;
    const completedLessons = chapterLessons.filter(
      (lesson) => progress[lesson._id]?.status === "completed",
    ).length;
    return Math.round((completedLessons / chapterLessons.length) * 100);
  };

  // Build curriculum structure respecting order
  const curriculumItems = [];

  // Sort chapters by order
  const sortedChapters = [...chapters].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  // Sort lessons by order
  const sortedLessons = [...lessons].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  // Add all chapters with their lessons
  sortedChapters.forEach((chapter) => {
    const chapterLessons = sortedLessons.filter(
      (lesson) => lesson.chapter?._id === chapter._id,
    );
    if (chapterLessons.length > 0) {
      curriculumItems.push({
        type: "chapter",
        data: chapter,
        lessons: chapterLessons,
        order: chapter.order !== undefined ? chapter.order : 0,
      });
    }
  });

  // Add individual lessons (not in any chapter)
  sortedLessons
    .filter((lesson) => !lesson.chapter)
    .forEach((lesson) => {
      curriculumItems.push({
        type: "lesson",
        data: lesson,
        order: lesson.order !== undefined ? lesson.order : 0,
      });
    });

  // Sort by order
  curriculumItems.sort((a, b) => a.order - b.order);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={(e) => {
              e.stopPropagation();
              const event = new CustomEvent("closeSidebar");
              window.dispatchEvent(event);
            }}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white border-l border-gray-200 z-40 lg:relative lg:w-80 lg:border-l lg:flex-shrink-0"
          >
            <div className="flex flex-col h-full">
              {/* Progress Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                    Course Progress
                  </h3>
                  <button
                    onClick={() => {
                      const event = new CustomEvent("closeSidebar");
                      window.dispatchEvent(event);
                    }}
                    className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors tap-target"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateOverallProgress()}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {calculateOverallProgress()}%
                  </span>
                </div>
              </div>

              {/* Lessons List */}
              <div className="flex-1 overflow-y-auto pb-20">
                <div className="p-3 space-y-2">
                  {curriculumItems.map((item, index) => {
                    if (item.type === "chapter") {
                      const chapter = item.data;
                      const chapterIndex = chapters.findIndex(
                        (c) => c._id === chapter._id,
                      );
                      const chapterProgress = calculateChapterProgress(
                        item.lessons,
                      );
                      const isExpanded = expandedChapters[chapter._id];
                      return (
                        <div
                          key={chapter._id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleChapter(chapter._id)}
                            className="w-full bg-gray-50 px-3 py-2.5 flex items-center justify-between hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-semibold text-orange-600">
                                  {chapterIndex + 1}
                                </span>
                              </div>
                              <div className="flex-1 text-left">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {chapter.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                                    <div
                                      className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                                      style={{ width: `${chapterProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {chapterProgress}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            {isExpanded ? (
                              <FiChevronUp className="w-4 h-4 text-gray-500 ml-2" />
                            ) : (
                              <FiChevronDown className="w-4 h-4 text-gray-500 ml-2" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="bg-white">
                              {item.lessons.map((lesson, lessonIndex) => {
                                const isCurrentLesson =
                                  currentLesson?._id === lesson._id;
                                const hasResources =
                                  lesson.attachments &&
                                  lesson.attachments.length > 0;
                                const isResourcesExpanded =
                                  expandedResources[lesson._id];
                                return (
                                  <div key={lesson._id}>
                                    <button
                                      onClick={() => {
                                        console.log(
                                          "Lesson clicked:",
                                          lesson.title,
                                        );
                                        onLessonSelect(lesson);
                                      }}
                                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors border-t border-gray-100 ${
                                        isCurrentLesson
                                          ? "bg-orange-50"
                                          : "hover:bg-gray-50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {getIcon(lesson.type)}
                                        <span className="text-xs text-gray-500">
                                          {lessonIndex + 1}.
                                        </span>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {lesson.title}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                          {lesson.type}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {hasResources && (
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleResources(lesson._id);
                                            }}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                                            title="Resources"
                                          >
                                            <FiPaperclip className="w-3 h-3 text-gray-500" />
                                          </div>
                                        )}
                                        {getProgressCircle(lesson._id)}
                                      </div>
                                    </button>

                                    {hasResources && isResourcesExpanded && (
                                      <div className="bg-gray-50 px-3 py-2 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-600 mb-2">
                                          Resources:
                                        </p>
                                        <div className="space-y-1">
                                          {lesson.attachments.map(
                                            (attachment, idx) => (
                                              <a
                                                key={idx}
                                                href={`http://localhost:3000${attachment.filePath}`}
                                                download={attachment.fileName}
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                                className="flex items-center gap-2 text-xs text-orange-600 hover:text-orange-800 hover:underline"
                                              >
                                                <FiDownload className="w-3 h-3" />
                                                <span className="truncate">
                                                  {attachment.fileName}
                                                </span>
                                              </a>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      const lesson = item.data;
                      const hasResources =
                        lesson.attachments && lesson.attachments.length > 0;
                      const isResourcesExpanded = expandedResources[lesson._id];
                      return (
                        <div key={lesson._id}>
                          <button
                            onClick={() => onLessonSelect(lesson)}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors border border-gray-200 ${
                              currentLesson?._id === lesson._id
                                ? "bg-orange-50 border-orange-200"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {getIcon(lesson.type)}
                              <span className="text-xs text-gray-500">
                                {index + 1}.
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {lesson.type}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {hasResources && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleResources(lesson._id);
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                                  title="Resources"
                                >
                                  <FiPaperclip className="w-3 h-3 text-gray-500" />
                                </div>
                              )}
                              {getProgressCircle(lesson._id)}
                            </div>
                          </button>

                          {hasResources && isResourcesExpanded && (
                            <div className="bg-gray-50 px-3 py-2 mt-1 rounded-lg border border-gray-200">
                              <p className="text-xs font-medium text-gray-600 mb-2">
                                Resources:
                              </p>
                              <div className="space-y-1">
                                {lesson.attachments.map((attachment, idx) => (
                                  <a
                                    key={idx}
                                    href={`http://localhost:3000${attachment.filePath}`}
                                    download={attachment.fileName}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2 text-xs text-orange-600 hover:text-orange-800 hover:underline"
                                  >
                                    <FiDownload className="w-3 h-3" />
                                    <span className="truncate">
                                      {attachment.fileName}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>

              {/* Certificate Section */}
              {courseSettings?.certificateEnabled && (
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t border-gray-200">
                  {calculateOverallProgress() === 100 ? (
                    <button
                      onClick={handleDownloadCertificate}
                      disabled={downloading}
                      className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 tap-target"
                    >
                      {downloading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FiDownload className="w-4 h-4" />
                          Download Certificate
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiLock className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Certificate Locked
                        </p>
                        <p className="text-xs text-gray-600">
                          Complete all lessons to unlock
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LearningSidebar;
