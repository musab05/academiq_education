import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { pushNavigation, popNavigation } from "../store/slices/navigationSlice";
import { motion } from "framer-motion";
import { MdOutlineQuiz } from "react-icons/md";
import {
  FiPlay,
  FiStar,
  FiTrash2,
  FiSend,
  FiChevronDown,
  FiChevronUp,
  FiMessageCircle,
  FiHelpCircle,
  FiBookOpen,
  FiUser,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import Header from "../components/Header";
import Hero from "../components/showCourseComponent/Hero";
import Tabs from "../components/showCourseComponent/Tabs";
import SidebarCard from "../components/showCourseComponent/SidebarCard";
import { lessonAPI, courseAPI, enrollmentAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";

const CurriculumAccordion = ({ chapters, lessonsWithoutChapter, getIcon }) => {
  const [expandedChapters, setExpandedChapters] = useState({});

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  return (
    <div className="space-y-3">
      {chapters.map((chapter, chapterIndex) => {
        const isExpanded = expandedChapters[chapter._id];
        return (
          <motion.div
            key={chapter._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: chapterIndex * 0.05 }}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
          >
            <button
              onClick={() => toggleChapter(chapter._id)}
              className="w-full bg-gradient-to-r from-gray-50 to-white px-4 sm:px-5 py-4 flex items-center justify-between hover:from-gray-100 hover:to-gray-50 transition-all tap-target"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                  <span className="text-sm sm:text-base font-bold text-white">
                    {chapterIndex + 1}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                    {chapter.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {chapter.lessons.length} lesson
                    {chapter.lessons.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isExpanded ? "bg-orange-100 rotate-180" : "bg-gray-100"}`}
              >
                <FiChevronDown
                  className={`w-5 h-5 transition-colors ${isExpanded ? "text-orange-600" : "text-gray-500"}`}
                />
              </div>
            </button>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-gray-50/50"
              >
                {chapter.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson._id}
                    className="px-4 sm:px-5 py-3 sm:py-4 hover:bg-white border-t border-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow border border-gray-100 flex-shrink-0">
                        {getIcon(lesson.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">
                          {lesson.type} lesson
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {lessonIndex + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {lessonsWithoutChapter.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
            Additional Lessons
          </div>
          <div className="space-y-2">
            {lessonsWithoutChapter.map((lesson, index) => (
              <div
                key={lesson._id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 group-hover:border-gray-200 transition-colors">
                  {getIcon(lesson.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {lesson.type}
                  </p>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {chapters.length + index + 1}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const AnswerForm = ({ faqId, onAnswer }) => {
  const [answer, setAnswer] = React.useState("");

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onAnswer(faqId, answer);
    setAnswer("");
  };

  return (
    <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3">
      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-xs sm:text-sm bg-gray-50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
        placeholder="Type your answer..."
      />
      <button
        onClick={handleSubmit}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm hover:shadow-lg hover:shadow-orange-200 transition-all duration-300 flex items-center gap-2 tap-target"
      >
        <FiSend className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Reply</span>
      </button>
    </div>
  );
};

export default function ShowCoursePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { slug } = useParams();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("Course");
  const [lessons, setLessons] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const { currentCourseId } = useSelector((state) => state.lesson);
  const { courses } = useSelector((state) => state.course);
  const { navigationStack = [] } = useSelector((state) => state.navigation);
  const userState = useSelector((state) => state.user);
  const user = userState?.user;
  const userId = userState?.token
    ? JSON.parse(atob(userState.token.split(".")[1])).id
    : null;

  // Check enrollment status whenever user or course changes
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!courseData?._id) {
        setCheckingEnrollment(false);
        return;
      }

      if (!user || !userId) {
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        return;
      }

      setCheckingEnrollment(true);
      try {
        const enrollments = await enrollmentAPI.getEnrollments({
          enrolleeType: "user",
          enrolleeId: userId,
          courseId: courseData._id,
        });
        setIsEnrolled(enrollments.data.data.length > 0);
      } catch (err) {
        console.error("Error checking enrollment:", err);
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [user, userId, courseData?._id]);

  useEffect(() => {
    if (slug) {
      fetchCourseBySlug();
    } else if (currentCourseId) {
      fetchCourseData();
    }
  }, [slug, currentCourseId]);

  const fetchCourseBySlug = async () => {
    try {
      setLoading(true);
      const courseResponse = await courseAPI.getBySlug(slug);
      console.log("Course data received:", courseResponse.data);
      console.log("Enrollment count:", courseResponse.data.enrollmentCount);
      console.log("Reviews:", courseResponse.data.reviews);
      setCourseData(courseResponse.data);
      const lessonsResponse = await lessonAPI.getLessons(
        courseResponse.data._id,
      );
      setLessons(lessonsResponse.data.lessons || []);
      setChapters(lessonsResponse.data.chapters || []);
      setComments(courseResponse.data.comments || []);
      setReviews(courseResponse.data.reviews || []);
      setFaqs(courseResponse.data.faqs || []);
      // Enrollment check is handled by separate useEffect
    } catch (error) {
      console.error("Error fetching course:", error);
      showNotification({ type: "error", message: "Failed to load course" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const foundCourse = courses.find((c) => c._id === currentCourseId);
      if (foundCourse?.slug) {
        const courseResponse = await courseAPI.getBySlug(foundCourse.slug);
        setCourseData(courseResponse.data);
        setComments(courseResponse.data.comments || []);
        setReviews(courseResponse.data.reviews || []);
        setFaqs(courseResponse.data.faqs || []);
      } else {
        setCourseData(foundCourse);
        setComments(foundCourse?.comments || []);
        setReviews(foundCourse?.reviews || []);
        setFaqs(foundCourse?.faqs || []);
      }
      const lessonsResponse = await lessonAPI.getLessons(currentCourseId);
      setLessons(lessonsResponse.data.lessons || []);
      setChapters(lessonsResponse.data.chapters || []);
      // Enrollment check is handled by separate useEffect
    } catch (error) {
      console.error("Error fetching course data:", error);
      if (error.response?.status === 403) {
        setLessons([]);
        setChapters([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!user) {
      showNotification({ type: "error", message: "Please login to comment" });
      return;
    }
    if (!comment.trim()) return;
    try {
      console.log("Posting comment to:", slug || courseData.slug);
      const response = await courseAPI.addComment(slug || courseData.slug, {
        text: comment,
      });
      console.log("Comment response:", response.data);
      setComments([response.data, ...comments]);
      setComment("");
      showNotification({ type: "success", message: "Comment posted" });
    } catch (error) {
      console.error(
        "Error posting comment:",
        error.response?.data || error.message,
      );
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to post comment",
      });
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await courseAPI.deleteComment(slug || courseData.slug, id);
      setComments(comments.filter((c) => c._id !== id));
      showNotification({ type: "success", message: "Comment deleted" });
    } catch (error) {
      showNotification({ type: "error", message: "Failed to delete comment" });
    }
  };

  const handlePostReview = async () => {
    if (!user) {
      showNotification({ type: "error", message: "Please login to review" });
      return;
    }
    if (!reviewText.trim()) return;
    try {
      const response = await courseAPI.addReview(slug || courseData.slug, {
        rating,
        text: reviewText,
      });
      const existingIndex = reviews.findIndex((r) => r.user._id === userId);
      if (existingIndex >= 0) {
        const updated = [...reviews];
        updated[existingIndex] = response.data;
        setReviews(updated);
        showNotification({ type: "success", message: "Review updated" });
      } else {
        setReviews([response.data, ...reviews]);
        showNotification({ type: "success", message: "Review submitted" });
      }
      setReviewText("");
      setRating(5);
      setIsEditingReview(false);
    } catch (error) {
      showNotification({ type: "error", message: "Failed to submit review" });
    }
  };

  const handleAskQuestion = async () => {
    if (!user) {
      showNotification({
        type: "error",
        message: "Please login to ask a question",
      });
      return;
    }
    if (!faqQuestion.trim()) return;
    try {
      console.log("Posting FAQ to:", slug || courseData.slug);
      const response = await courseAPI.addFaq(slug || courseData.slug, {
        question: faqQuestion,
      });
      console.log("FAQ response:", response.data);
      setFaqs([response.data, ...faqs]);
      setFaqQuestion("");
      showNotification({ type: "success", message: "Question posted" });
    } catch (error) {
      console.error(
        "Error posting FAQ:",
        error.response?.data || error.message,
      );
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to post question",
      });
    }
  };

  const handleAnswerQuestion = async (id, answer) => {
    try {
      await courseAPI.answerFaq(slug || courseData.slug, id, { answer });
      setFaqs(faqs.map((f) => (f._id === id ? { ...f, answer } : f)));
      showNotification({ type: "success", message: "Answer posted" });
    } catch (error) {
      showNotification({ type: "error", message: "Failed to post answer" });
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await courseAPI.deleteFaq(slug || courseData.slug, id);
      setFaqs(faqs.filter((f) => f._id !== id));
      showNotification({ type: "success", message: "Question deleted" });
    } catch (error) {
      showNotification({ type: "error", message: "Failed to delete question" });
    }
  };

  const canAnswerFaq =
    user && ["admin", "superadmin", "instructor"].includes(user.role);

  const handleEnroll = async () => {
    if (!user) {
      showNotification({ type: "error", message: "Please login to enroll" });
      return;
    }
    if (isEnrolled) {
      handleStart();
      return;
    }
    setEnrolling(true);
    try {
      await enrollmentAPI.createEnrollment({
        courseId: courseData._id,
        enrolleeType: "user",
      });
      setIsEnrolled(true);
      showNotification({ type: "success", message: "Successfully enrolled!" });
    } catch (error) {
      if (error.response?.data?.error === "Enrollment already exists") {
        setIsEnrolled(true);
        showNotification({ type: "info", message: "Already enrolled" });
      } else {
        showNotification({
          type: "error",
          message: error.response?.data?.error || "Failed to enroll",
        });
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleStart = () => {
    dispatch(pushNavigation(`/course-preview/${courseData.slug}`));
    navigate(`/learn/${courseData._id}`);
  };

  useEffect(() => {
    if (slug && slug.length === 24 && /^[0-9a-fA-F]{24}$/.test(slug)) {
      navigate("/", { replace: true });
    }
  }, [slug, navigate]);

  if (loading || !courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course preview...</p>
        </div>
      </div>
    );
  }

  const curriculumData = chapters.map((chapter) => ({
    ...chapter,
    lessons: lessons.filter((lesson) => lesson.chapter?._id === chapter._id),
  }));

  const lessonsWithoutChapter = lessons.filter((lesson) => !lesson.chapter);

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0";

  const enrolledCount = courseData.enrollmentCount || 0;
  console.log("=== ENROLLMENT COUNT ===", enrolledCount);
  console.log("=== COURSE DATA ===", courseData);

  const course = {
    title: courseData.title,
    thumbnail: courseData.thumbnail,
    meta: {
      students: `${enrolledCount} student${enrolledCount !== 1 ? "s" : ""}`,
      rating: avgRating,
      reviews: reviews.length,
    },
    lessons: lessons,
    chapters: curriculumData,
    lessonsWithoutChapter,
    price: courseData.price ? `₹${courseData.price}` : "Free",
    level: courseData.level || "Beginner",
    language: courseData.language || "English",
    instructor: courseData.createdBy ||
      user || { firstName: "Course", lastName: "Instructor" },
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header
        mode="preview"
        title="Course Preview"
        onBack={() => {
          if (navigationStack.length > 0) {
            const previousRoute = navigationStack[navigationStack.length - 1];
            dispatch(popNavigation());
            navigate(previousRoute);
          } else if (user?.role === "student") {
            navigate("/all-courses");
          } else {
            navigate(`/course-overview/${courseData.slug}`);
          }
        }}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-12">
          <Hero
            title={course.title}
            meta={course.meta}
            thumbnail={course.thumbnail}
            description={courseData?.description}
            instructor={course.instructor}
            level={course.level}
          />
        </div>

        <div className="lg:col-span-8">
          <div className="mt-4 lg:-mt-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                <div>
                  <Tabs
                    tabs={[
                      "Course",
                      "Curriculum",
                      "Instructor",
                      "FAQ",
                      "Reviews",
                    ]}
                    active={activeTab}
                    onChange={setActiveTab}
                  />
                </div>
                <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  Last updated: Jul 2025
                </div>
              </div>

              <div className="mt-4 sm:mt-5 md:mt-6">
                {activeTab === "Course" && (
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                      About this course
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                      {courseData?.description ||
                        "Course description will appear here."}
                    </p>

                    <div className="mt-6 sm:mt-8">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                          Comments ({comments.length})
                        </h3>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        {comments.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                            </div>
                            <p className="text-gray-500 text-sm">
                              No comments yet. Be the first to share your
                              thoughts!
                            </p>
                          </div>
                        ) : (
                          comments.map((c) => (
                            <motion.div
                              key={c._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 sm:p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {c.user.firstName?.[0]}
                                    {c.user.lastName?.[0]}
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm text-gray-900">
                                      {c.user.firstName} {c.user.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(c.createdAt).toLocaleDateString(
                                        "en-US",
                                        {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        },
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {user?._id === c.user._id && (
                                  <button
                                    onClick={() => handleDeleteComment(c._id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mt-3 pl-13">
                                {c.text}
                              </p>
                            </motion.div>
                          ))
                        )}
                      </div>

                      <div className="mt-4 sm:mt-6 p-4 bg-white border border-gray-200 rounded-xl">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none h-24 sm:h-28 text-sm focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                          placeholder="Share your thoughts about this course..."
                        ></textarea>
                        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="text-xs text-gray-500">
                            {!user && "Please log in to post a comment."}
                          </div>
                          <button
                            onClick={handlePostComment}
                            disabled={!user}
                            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-orange-200 transition-all duration-300 tap-target"
                          >
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Curriculum" && (
                  <div>
                    <div className="mb-3 sm:mb-4 md:mb-6">
                      <h2 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900">
                        Course Content
                      </h2>
                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-1">
                        {course.chapters.length +
                          (course.lessonsWithoutChapter.length > 0
                            ? 1
                            : 0)}{" "}
                        sections • {course.lessons.length} lectures
                      </p>
                    </div>

                    {course.chapters.length === 0 &&
                    course.lessonsWithoutChapter.length === 0 ? (
                      <div className="text-center py-12">
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
                          No content available
                        </h3>
                        <p className="text-gray-500">
                          This course doesn't have any lessons yet.
                        </p>
                      </div>
                    ) : (
                      <CurriculumAccordion
                        chapters={course.chapters}
                        lessonsWithoutChapter={course.lessonsWithoutChapter}
                        getIcon={getIcon}
                      />
                    )}
                  </div>
                )}

                {activeTab === "Instructor" && (
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                      About the Instructor
                    </h2>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 sm:mt-6 p-5 sm:p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl mx-auto sm:mx-0 shadow-lg shadow-orange-200 flex-shrink-0">
                          {course.instructor.firstName?.[0] || "I"}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="font-semibold text-lg sm:text-xl text-gray-900">
                            {course.instructor.firstName}{" "}
                            {course.instructor.lastName}
                          </h3>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm text-gray-500">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span>{course.instructor.email}</span>
                          </div>

                          {course.instructor.bio && (
                            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                              {course.instructor.bio}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
                              <svg
                                className="w-4 h-4 text-orange-600"
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
                              <span className="text-xs font-medium text-orange-700">
                                Course Instructor
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                              <svg
                                className="w-4 h-4 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                />
                              </svg>
                              <span className="text-xs font-medium text-red-700">
                                Verified Expert
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {activeTab === "FAQ" && (
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                      Questions & Answers
                    </h2>

                    <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">
                          Ask a Question
                        </span>
                      </div>
                      <textarea
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                        className="w-full p-3 sm:p-4 bg-white border border-gray-200 rounded-xl resize-none h-20 sm:h-24 text-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                        placeholder="What would you like to know about this course?"
                      ></textarea>
                      <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="text-xs text-gray-500">
                          {!user && "Please log in to ask a question."}
                        </div>
                        <button
                          onClick={handleAskQuestion}
                          disabled={!user}
                          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-orange-200 transition-all duration-300 tap-target"
                        >
                          Submit Question
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8 space-y-4">
                      {faqs.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-7 h-7 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            No questions yet
                          </h3>
                          <p className="text-gray-500 text-sm">
                            Be the first to ask about this course!
                          </p>
                        </div>
                      ) : (
                        faqs.map((faq) => (
                          <motion.div
                            key={faq._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-orange-600 font-semibold text-sm">
                                      Q
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                                      {faq.question}
                                    </p>
                                    <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
                                      <span>
                                        Asked by{" "}
                                        {faq.askedBy?.firstName || "User"}{" "}
                                        {faq.askedBy?.lastName || ""}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        {new Date(
                                          faq.createdAt,
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {(user?._id === faq.askedBy?._id ||
                                canAnswerFaq) && (
                                <button
                                  onClick={() => handleDeleteFaq(faq._id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {faq.answer ? (
                              <div className="mt-4 flex items-start gap-3 pl-0 sm:pl-11">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-red-600 font-semibold text-sm">
                                    A
                                  </span>
                                </div>
                                <div className="flex-1 p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-100">
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {faq.answer}
                                  </p>
                                </div>
                              </div>
                            ) : canAnswerFaq ? (
                              <div className="pl-0 sm:pl-11 mt-3">
                                <AnswerForm
                                  faqId={faq._id}
                                  onAnswer={handleAnswerQuestion}
                                />
                              </div>
                            ) : (
                              <div className="mt-4 pl-0 sm:pl-11 flex items-center gap-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                                <span className="italic">
                                  Awaiting instructor response...
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "Reviews" && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                      <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                        Student Reviews
                      </h2>
                      {reviews.length > 0 && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={`avg-star-${i}`}
                                className={`w-4 h-4 ${i < Math.round(parseFloat(avgRating)) ? "fill-orange-500 text-orange-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {avgRating}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({reviews.length} reviews)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {reviews.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiStar className="w-7 h-7 text-gray-400" />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            No reviews yet
                          </h3>
                          <p className="text-gray-500 text-sm">
                            Be the first to share your experience!
                          </p>
                        </div>
                      ) : (
                        reviews.map((review) => (
                          <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                  {review.user.firstName?.[0]}
                                  {review.user.lastName?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-900">
                                    {review.user.firstName}{" "}
                                    {review.user.lastName}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <FiStar
                                          key={`review-${review._id}-star-${i}`}
                                          className={`w-3.5 h-3.5 ${i < review.rating ? "fill-orange-500 text-orange-500" : "text-gray-300"}`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        review.createdAt,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {userId === review.user?._id && (
                                <button
                                  onClick={() => {
                                    setReviewText(review.text);
                                    setRating(review.rating);
                                    setIsEditingReview(true);
                                  }}
                                  className="text-gray-400 hover:text-orange-500 transition-colors p-2 hover:bg-orange-50 rounded-lg"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-3 leading-relaxed pl-13">
                              {review.text}
                            </p>
                          </motion.div>
                        ))
                      )}
                    </div>

                    {(!reviews.find((r) => r.user?._id === userId) ||
                      isEditingReview) && (
                      <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <FiStar className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-medium text-gray-900">
                            {isEditingReview
                              ? "Edit Your Review"
                              : "Leave a Review"}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm font-medium text-gray-700">
                            Your Rating:
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={`rating-${star}`}
                                onClick={() => setRating(star)}
                                className={`w-6 h-6 cursor-pointer transition-all hover:scale-110 tap-target ${star <= rating ? "fill-orange-500 text-orange-500" : "text-gray-300 hover:text-orange-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            ({rating}/5)
                          </span>
                        </div>

                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full p-3 sm:p-4 bg-white border border-gray-200 rounded-xl resize-none h-24 sm:h-28 text-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                          placeholder="Share your learning experience with this course..."
                        ></textarea>
                        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="text-xs text-gray-500">
                            {!user && "Please log in to leave a review."}
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            {isEditingReview && (
                              <button
                                onClick={() => {
                                  setIsEditingReview(false);
                                  setReviewText("");
                                  setRating(5);
                                }}
                                className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all tap-target"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={handlePostReview}
                              disabled={!user}
                              className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-orange-200 transition-all duration-300 tap-target"
                            >
                              {isEditingReview
                                ? "Update Review"
                                : "Submit Review"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-6">
            <SidebarCard
              price={course.price}
              lectures={course.lessons.length}
              level={course.level}
              language={course.language}
              onEnroll={isEnrolled ? handleStart : handleEnroll}
              isEnrolled={isEnrolled}
              enrolling={enrolling}
              checkingEnrollment={checkingEnrollment}
            />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mt-4 sm:mt-6"
            >
              <div className="bg-white p-5 sm:p-6 border border-gray-100 rounded-2xl shadow-lg">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Course Features
                </h4>

                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MdOutlineQuiz className="w-5 h-5 text-orange-600" />
                    </div>
                    <span>Interactive Quizzes</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiPlay className="w-5 h-5 text-red-600" />
                    </div>
                    <span>HD Video Lectures</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiStar className="w-5 h-5 text-orange-600" />
                    </div>
                    <span>Certificate of Completion</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
