import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  setAllLessonProgress,
  setLastLesson,
} from "../store/slices/progressSlice";
import { popNavigation } from "../store/slices/navigationSlice";
import { ArrowLeft } from "lucide-react";
import LearningHeader from "../components/learning/LearningHeader";
import LearningContent from "../components/learning/LearningContent";
import LearningSidebar from "../components/learning/LearningSidebar";
import LearningAssistant from "../components/learning/LearningAssistant";
import { lessonAPI, progressAPI } from "../services/api";

const CourseLearningPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseSlug, setCourseSlug] = useState(null);
  const [progressUpdateKey, setProgressUpdateKey] = useState(0);

  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courses } = useSelector((state) => state.course);
  const { user } = useSelector((state) => state.user);
  const { lessonProgress, lastLesson } = useSelector((state) => state.progress);
  const { navigationStack = [] } = useSelector((state) => state.navigation);
  const progress = useMemo(
    () => lessonProgress[courseId] || {},
    [lessonProgress, courseId],
  );

  console.log("Redux lessonProgress for courseId", courseId, ":", progress);

  // Force sidebar update when progress changes
  useEffect(() => {
    const progressCount = Object.keys(progress).length;
    console.log("Progress changed, keys count:", progressCount);
    if (progressCount > 0) {
      setProgressUpdateKey((prev) => prev + 1);
    }
  }, [JSON.stringify(progress)]);

  const courseData = courses.find((c) => c._id === courseId);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  useEffect(() => {
    const handleCloseSidebar = () => {
      setSidebarOpen(false);
    };
    window.addEventListener("closeSidebar", handleCloseSidebar);
    return () => {
      window.removeEventListener("closeSidebar", handleCloseSidebar);
    };
  }, []);

  useEffect(() => {
    const handleLessonCompleted = () => {
      console.log("Lesson completed event received, refreshing progress...");
      setTimeout(async () => {
        await refreshProgress();
        setProgressUpdateKey((prev) => prev + 1);
      }, 500);
    };

    const handleScormProgressUpdate = () => {
      console.log(
        "SCORM progress update event received, refreshing progress...",
      );
      setTimeout(async () => {
        await refreshProgress();
        setProgressUpdateKey((prev) => prev + 1);
      }, 500);
    };

    window.addEventListener("lessonCompleted", handleLessonCompleted);
    window.addEventListener("scormProgressUpdate", handleScormProgressUpdate);
    return () => {
      window.removeEventListener("lessonCompleted", handleLessonCompleted);
      window.removeEventListener(
        "scormProgressUpdate",
        handleScormProgressUpdate,
      );
    };
  }, [courseId, lessons]);

  const fetchProgressData = async (lessons) => {
    try {
      const progressData = {};

      for (const lesson of lessons) {
        try {
          let progressResponse;
          if (lesson.type === "text") {
            progressResponse = await progressAPI.getTextLessonProgress(
              lesson._id,
            );
          } else if (lesson.type === "video") {
            progressResponse = await progressAPI.getVideoLessonProgress(
              lesson._id,
            );
          } else if (lesson.type === "block" || lesson.type === "blocks") {
            progressResponse = await progressAPI.getBlockLessonProgress(
              lesson._id,
            );
          } else if (lesson.type === "scorm") {
            progressResponse = await progressAPI.getScormLessonProgress(
              lesson._id,
            );
            const scormProgress =
              progressResponse?.data?.cmiData?.["cmi.core.score.raw"] ||
              progressResponse?.data?.cmiData?.["cmi.score.raw"] ||
              0;
            const isScormCompleted =
              progressResponse?.data?.isCompleted === true;

            if (isScormCompleted) {
              progressData[lesson._id] = {
                status: "completed",
                progress: 100,
              };
            } else if (scormProgress > 0) {
              progressData[lesson._id] = {
                status: "in_progress",
                progress: parseFloat(scormProgress),
              };
            } else {
              progressData[lesson._id] = {
                status: "not_started",
                progress: 0,
              };
            }
            continue;
          } else if (lesson.type === "quiz") {
            progressResponse = await progressAPI.getQuizProgress(lesson._id);
          } else if (lesson.type === "assignment") {
            progressResponse = await progressAPI.getAssignmentProgress(
              lesson._id,
            );
          } else if (lesson.type === "document") {
            progressResponse = await progressAPI.getDocumentProgress(
              lesson._id,
            );
          }

          if (lesson.type !== "scorm") {
            const isCompleted = progressResponse?.data?.isCompleted === true;
            console.log(
              `Lesson ${lesson.title} (${lesson._id}): isCompleted=${isCompleted}`,
            );

            if (isCompleted) {
              progressData[lesson._id] = {
                status: "completed",
                progress: 100,
              };
            } else {
              progressData[lesson._id] = {
                status: "not_started",
                progress: 0,
              };
            }
          }
        } catch (error) {
          console.log(
            `Error fetching progress for lesson ${lesson.title}:`,
            error.message,
          );
          if (lesson.type !== "scorm") {
            progressData[lesson._id] = {
              status: "not_started",
              progress: 0,
            };
          }
        }
      }

      console.log("Final progressData being dispatched:", progressData);
      dispatch(setAllLessonProgress({ courseId, progressData }));
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  const refreshProgress = async () => {
    if (lessons.length > 0) {
      console.log("Refreshing progress for", lessons.length, "lessons");
      await fetchProgressData(lessons);
      console.log(
        "Progress refreshed, new progress:",
        lessonProgress[courseId],
      );
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await lessonAPI.getLessons(courseId);
      const {
        lessons: fetchedLessons,
        chapters: fetchedChapters,
        course,
      } = response.data;

      if (course?.slug) {
        setCourseSlug(course.slug);
      }

      // Sort chapters by order
      const sortedChapters = [...(fetchedChapters || [])].sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      );

      // Sort all lessons by order
      const sortedLessons = [...(fetchedLessons || [])].sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      );

      // Build ordered lesson list respecting chapters
      const orderedLessons = [];
      const curriculumItems = [];

      // Add chapters with their lessons (lessons inside chapters are also sorted by order)
      sortedChapters.forEach((chapter) => {
        const chapterLessons = sortedLessons.filter(
          (l) => l.chapter?._id === chapter._id,
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

      // Add standalone lessons (not in any chapter)
      sortedLessons
        .filter((l) => !l.chapter)
        .forEach((lesson) => {
          curriculumItems.push({
            type: "lesson",
            data: lesson,
            order: lesson.order !== undefined ? lesson.order : 0,
          });
        });

      // Sort curriculum items by order
      curriculumItems.sort((a, b) => a.order - b.order);

      // Flatten to ordered lesson list
      curriculumItems.forEach((item) => {
        if (item.type === "chapter") {
          orderedLessons.push(...item.lessons);
        } else {
          orderedLessons.push(item.data);
        }
      });

      setLessons(orderedLessons);
      setChapters(fetchedChapters || []);

      // Set last accessed lesson or first lesson
      if (orderedLessons.length > 0) {
        const lastLessonId = lastLesson[courseId];
        const lastLessonObj = lastLessonId
          ? orderedLessons.find((l) => l._id === lastLessonId)
          : null;
        setCurrentLesson(lastLessonObj || orderedLessons[0]);
      }

      // Fetch real progress data
      await fetchProgressData(orderedLessons);
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    console.log("handleLessonSelect called with:", lesson.title);
    setCurrentLesson(lesson);
    dispatch(setLastLesson({ courseId, lessonId: lesson._id }));
    // Refresh progress after a short delay to ensure state updates
    setTimeout(() => {
      refreshProgress();
    }, 100);
  };

  const handleBack = () => {
    if (navigationStack.length > 0) {
      const previousRoute = navigationStack[navigationStack.length - 1];
      dispatch(popNavigation());
      navigate(previousRoute);
    } else {
      navigate("/dashboard");
    }
  };

  const handleNextLesson = () => {
    const currentIndex = lessons.findIndex((l) => l._id === currentLesson?._id);
    console.log(
      "handleNextLesson - Current lesson:",
      currentLesson?.title,
      "ID:",
      currentLesson?._id,
    );
    console.log(
      "Current index:",
      currentIndex,
      "Total lessons:",
      lessons.length,
    );
    console.log(
      "All lesson IDs:",
      lessons.map((l) => ({ id: l._id, title: l.title })),
    );
    console.log("hasNext should be:", currentIndex < lessons.length - 1);
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      console.log(
        "Moving to next lesson:",
        nextLesson.title,
        "ID:",
        nextLesson._id,
      );
      handleLessonSelect(nextLesson);
    } else {
      console.log("Cannot move to next lesson - at end or invalid index");
    }
  };

  const handlePreviousLesson = () => {
    const currentIndex = lessons.findIndex((l) => l._id === currentLesson?._id);
    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      console.log("Moving to previous lesson:", prevLesson.title);
      handleLessonSelect(prevLesson);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  const currentIndex = lessons.findIndex((l) => l._id === currentLesson?._id);
  const hasNext = currentIndex !== -1 && currentIndex < lessons.length - 1;
  const hasPrevious = currentIndex > 0;

  console.log(
    "Render - Current lesson:",
    currentLesson?.title,
    "Index:",
    currentIndex,
    "hasNext:",
    hasNext,
    "hasPrevious:",
    hasPrevious,
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LearningHeader
        courseTitle={courseData?.title || "Course"}
        onBack={handleBack}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <LearningContent
          lesson={currentLesson}
          sidebarOpen={sidebarOpen}
          onNextLesson={handleNextLesson}
          onPreviousLesson={handlePreviousLesson}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onProgressUpdate={refreshProgress}
        />

        <LearningSidebar
          open={sidebarOpen}
          lessons={lessons}
          chapters={chapters}
          currentLesson={currentLesson}
          progress={progress}
          progressUpdateTrigger={progressUpdateKey}
          onLessonSelect={handleLessonSelect}
        />
      </div>

      <LearningAssistant lessonId={currentLesson?._id} courseId={courseId} />
    </div>
  );
};

export default CourseLearningPage;
