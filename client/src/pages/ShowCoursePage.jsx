import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { pushNavigation, popNavigation } from "../store/slices/navigationSlice";
import { motion } from "framer-motion";
import { MdOutlineQuiz } from "react-icons/md";
import { FiPlay, FiStar, FiTrash2, FiSend, FiChevronDown, FiChevronUp } from "react-icons/fi";
import Header from "../components/Header";
import Hero from "../components/showCourseComponent/Hero";
import Tabs from "../components/showCourseComponent/Tabs";
import SidebarCard from "../components/showCourseComponent/SidebarCard";
import { lessonAPI, courseAPI, enrollmentAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";

const CurriculumAccordion = ({ chapters, lessonsWithoutChapter, getIcon }) => {
  const [expandedChapters, setExpandedChapters] = useState({});

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  return (
    <div className="space-y-2">
      {chapters.map((chapter, chapterIndex) => {
        const isExpanded = expandedChapters[chapter._id];
        return (
          <div key={chapter._id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleChapter(chapter._id)}
              className="w-full bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between hover:bg-gray-100 transition-colors tap-target"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-semibold text-orange-600">{chapterIndex + 1}</span>
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">{chapter.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {isExpanded ? <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" /> : <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />}
            </button>
            {isExpanded && (
              <div className="bg-white">
                {chapter.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson._id} className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {getIcon(lesson.type)}
                        <span className="text-xs sm:text-sm text-gray-500">{lessonIndex + 1}.</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">{lesson.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{lesson.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      {lessonsWithoutChapter.map((lesson, index) => (
        <div key={lesson._id} className="border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              {getIcon(lesson.type)}
              <span className="text-xs sm:text-sm text-gray-500">{chapters.length + index + 1}.</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-xs sm:text-sm">{lesson.title}</p>
              <p className="text-xs text-gray-500 capitalize">{lesson.type}</p>
            </div>
          </div>
        </div>
      ))}
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
    <div className="mt-2 sm:mt-3 flex gap-1.5 sm:gap-2">
      <input value={answer} onChange={(e) => setAnswer(e.target.value)} className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border rounded text-xs sm:text-sm" placeholder="Type your answer..." />
      <button onClick={handleSubmit} className="bg-orange-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm hover:bg-orange-600 flex items-center gap-1 tap-target">
        <FiSend className="w-3 h-3 sm:w-4 sm:h-4" />
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
  const [isEditingReview, setIsEditingReview] = useState(false);
  const { currentCourseId } = useSelector(state => state.lesson);
  const { courses } = useSelector(state => state.course);
  const { navigationStack = [] } = useSelector(state => state.navigation);
  const userState = useSelector(state => state.user);
  const user = userState?.user;
  const userId = userState?.token ? JSON.parse(atob(userState.token.split('.')[1])).id : null;
  
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
      console.log('Course data received:', courseResponse.data);
      console.log('Enrollment count:', courseResponse.data.enrollmentCount);
      console.log('Reviews:', courseResponse.data.reviews);
      setCourseData(courseResponse.data);
      const lessonsResponse = await lessonAPI.getLessons(courseResponse.data._id);
      setLessons(lessonsResponse.data.lessons || []);
      setChapters(lessonsResponse.data.chapters || []);
      setComments(courseResponse.data.comments || []);
      setReviews(courseResponse.data.reviews || []);
      setFaqs(courseResponse.data.faqs || []);
      if (user) {
        try {
          const enrollments = await enrollmentAPI.getEnrollments({ enrolleeType: 'user', courseId: courseResponse.data._id });
          setIsEnrolled(enrollments.data.data.length > 0);
        } catch (err) {
          console.error('Error checking enrollment:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      showNotification({ type: 'error', message: 'Failed to load course' });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const foundCourse = courses.find(c => c._id === currentCourseId);
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
      if (user) {
        try {
          const enrollments = await enrollmentAPI.getEnrollments({ enrolleeType: 'user', courseId: currentCourseId });
          setIsEnrolled(enrollments.data.data.length > 0);
        } catch (err) {
          console.error('Error checking enrollment:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
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
      showNotification({ type: 'error', message: 'Please login to comment' });
      return;
    }
    if (!comment.trim()) return;
    try {
      const response = await courseAPI.addComment(slug || courseData.slug, { text: comment });
      setComments([response.data, ...comments]);
      setComment("");
      showNotification({ type: 'success', message: 'Comment posted' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to post comment' });
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await courseAPI.deleteComment(slug || courseData.slug, id);
      setComments(comments.filter(c => c._id !== id));
      showNotification({ type: 'success', message: 'Comment deleted' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to delete comment' });
    }
  };

  const handlePostReview = async () => {
    if (!user) {
      showNotification({ type: 'error', message: 'Please login to review' });
      return;
    }
    if (!reviewText.trim()) return;
    try {
      const response = await courseAPI.addReview(slug || courseData.slug, { rating, text: reviewText });
      const existingIndex = reviews.findIndex(r => r.user._id === userId);
      if (existingIndex >= 0) {
        const updated = [...reviews];
        updated[existingIndex] = response.data;
        setReviews(updated);
        showNotification({ type: 'success', message: 'Review updated' });
      } else {
        setReviews([response.data, ...reviews]);
        showNotification({ type: 'success', message: 'Review submitted' });
      }
      setReviewText("");
      setRating(5);
      setIsEditingReview(false);
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to submit review' });
    }
  };

  const handleAskQuestion = async () => {
    if (!user) {
      showNotification({ type: 'error', message: 'Please login to ask a question' });
      return;
    }
    if (!faqQuestion.trim()) return;
    try {
      const response = await courseAPI.addFaq(slug || courseData.slug, { question: faqQuestion });
      setFaqs([response.data, ...faqs]);
      setFaqQuestion("");
      showNotification({ type: 'success', message: 'Question posted' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to post question' });
    }
  };

  const handleAnswerQuestion = async (id, answer) => {
    try {
      await courseAPI.answerFaq(slug || courseData.slug, id, { answer });
      setFaqs(faqs.map(f => f._id === id ? { ...f, answer } : f));
      showNotification({ type: 'success', message: 'Answer posted' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to post answer' });
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await courseAPI.deleteFaq(slug || courseData.slug, id);
      setFaqs(faqs.filter(f => f._id !== id));
      showNotification({ type: 'success', message: 'Question deleted' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to delete question' });
    }
  };

  const canAnswerFaq = user && ['admin', 'superadmin', 'instructor'].includes(user.role);

  const handleEnroll = async () => {
    if (!user) {
      showNotification({ type: 'error', message: 'Please login to enroll' });
      return;
    }
    if (isEnrolled) {
      handleStart();
      return;
    }
    setEnrolling(true);
    try {
      await enrollmentAPI.createEnrollment({ courseId: courseData._id, enrolleeType: 'user' });
      setIsEnrolled(true);
      showNotification({ type: 'success', message: 'Successfully enrolled!' });
    } catch (error) {
      if (error.response?.data?.error === 'Enrollment already exists') {
        setIsEnrolled(true);
        showNotification({ type: 'info', message: 'Already enrolled' });
      } else {
        showNotification({ type: 'error', message: error.response?.data?.error || 'Failed to enroll' });
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
      navigate('/', { replace: true });
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
  
  const curriculumData = chapters.map(chapter => ({
    ...chapter,
    lessons: lessons.filter(lesson => lesson.chapter?._id === chapter._id)
  }));
  
  const lessonsWithoutChapter = lessons.filter(lesson => !lesson.chapter);
  
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0";
  
  const enrolledCount = courseData.enrollmentCount || 0;
  console.log('=== ENROLLMENT COUNT ===', enrolledCount);
  console.log('=== COURSE DATA ===', courseData);
  
  const course = {
    title: courseData.title,
    thumbnail: courseData.thumbnail,
    meta: { 
      students: `${enrolledCount} student${enrolledCount !== 1 ? 's' : ''}`, 
      rating: avgRating, 
      reviews: reviews.length 
    },
    lessons: lessons,
    chapters: curriculumData,
    lessonsWithoutChapter,
    price: courseData.price ? `₹${courseData.price}` : "Free",
    level: courseData.level || "Beginner",
    language: courseData.language || "English",
    instructor: courseData.createdBy || user || { firstName: "Course", lastName: "Instructor" },
  };

  const getIcon = (type) => {
    switch(type) {
      case 'video': return <FiPlay className="w-4 h-4 text-blue-500" />;
      case 'quiz': return <MdOutlineQuiz className="w-4 h-4 text-green-500" />;
      case 'text': return <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'document': return <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
      case 'assignment': return <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
      default: return <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
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
          } else if (user?.role === 'student') {
            navigate('/all-courses');
          } else {
            navigate(`/course-overview/${courseData.slug}`);
          }
        }}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        <div className="md:col-span-12">
          <Hero title={course.title} meta={course.meta} thumbnail={course.thumbnail} />
        </div>

        <div className="md:col-span-8">
          <div className="-mt-3 sm:-mt-4 md:-mt-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-white rounded-md shadow p-3 sm:p-4 md:p-6 border">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                <div>
                  <Tabs tabs={["Course", "Curriculum", "Instructor", "FAQ", "Reviews"]} active={activeTab} onChange={setActiveTab} />
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Last updated: Jul 2025</div>
              </div>

              <div className="mt-4 sm:mt-5 md:mt-6">
                {activeTab === "Course" && (
                  <div>
                    <h2 className="text-sm sm:text-base md:text-lg font-semibold">About this course</h2>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600">{courseData?.description || "Course description will appear here."}</p>

                    <div className="mt-3 sm:mt-4 md:mt-6">
                      <h3 className="text-xs sm:text-sm font-medium">Comments ({comments.length})</h3>
                      <div className="mt-2 sm:mt-3 md:mt-4 space-y-2 sm:space-y-3">
                        {comments.map(c => (
                          <div key={c._id} className="p-2 sm:p-3 md:p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-xs sm:text-sm">{c.user.firstName} {c.user.lastName}</div>
                                <div className="text-[10px] sm:text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</div>
                              </div>
                              {user?._id === c.user._id && (
                                <button onClick={() => handleDeleteComment(c._id)} className="text-red-500 hover:text-red-700">
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700 mt-1.5 sm:mt-2">{c.text}</p>
                          </div>
                        ))}
                      </div>
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full mt-2 sm:mt-3 p-2 border rounded resize-none h-20 sm:h-24 md:h-28 text-xs sm:text-sm" placeholder="Write your comment..."></textarea>
                      <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="text-[10px] sm:text-xs text-gray-500">{!user && 'You must be logged in to post a comment.'}</div>
                        <button onClick={handlePostComment} disabled={!user} className="w-full sm:w-auto bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm disabled:opacity-50 tap-target">Post Comment</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Curriculum" && (
                  <div>
                    <div className="mb-3 sm:mb-4 md:mb-6">
                      <h2 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900">Course Content</h2>
                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-1">
                        {course.chapters.length + (course.lessonsWithoutChapter.length > 0 ? 1 : 0)} sections • {course.lessons.length} lectures
                      </p>
                    </div>
                    
                    {course.chapters.length === 0 && course.lessonsWithoutChapter.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
                        <p className="text-gray-500">This course doesn't have any lessons yet.</p>
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
                    <h2 className="text-sm sm:text-base md:text-lg font-semibold">About the Instructor</h2>
                    <div className="mt-2 sm:mt-3 md:mt-4 p-2 sm:p-3 md:p-4 border rounded-md flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-base sm:text-lg md:text-xl mx-auto sm:mx-0">
                        {course.instructor.firstName?.[0] || 'I'}
                      </div>
                      <div>
                        <div className="font-medium text-xs sm:text-sm md:text-base">{course.instructor.firstName} {course.instructor.lastName}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{course.instructor.email}</div>
                        {course.instructor.bio && (
                          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600">
                            {course.instructor.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "FAQ" && (
                  <div>
                    <h2 className="text-sm sm:text-base md:text-lg font-semibold">Questions & Answers</h2>

                    <div className="mt-2 sm:mt-3 md:mt-4">
                      <textarea value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} className="w-full p-2 border rounded resize-none h-16 sm:h-20 text-xs sm:text-sm" placeholder="Ask a question about this course..."></textarea>
                      <div className="mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                        <div className="text-[10px] sm:text-xs text-gray-500">{!user && 'You must be logged in to ask a question.'}</div>
                        <button onClick={handleAskQuestion} disabled={!user} className="w-full sm:w-auto bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm disabled:opacity-50 tap-target">Ask Question</button>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 md:mt-6 space-y-2 sm:space-y-3 md:space-y-4">
                      {faqs.length === 0 ? (
                        <p className="text-gray-500 text-xs sm:text-sm">No questions yet. Be the first to ask!</p>
                      ) : (
                        faqs.map((faq) => (
                          <div key={faq._id} className="p-2 sm:p-3 md:p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 text-xs sm:text-sm">{faq.question}</div>
                                <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Asked by {faq.askedBy?.firstName || 'User'} {faq.askedBy?.lastName || ''} • {new Date(faq.createdAt).toLocaleDateString()}</div>
                              </div>
                              {(user?._id === faq.askedBy?._id || canAnswerFaq) && (
                                <button onClick={() => handleDeleteFaq(faq._id)} className="text-red-500 hover:text-red-700">
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {faq.answer ? (
                              <div className="mt-2 sm:mt-3 pl-2 sm:pl-4 border-l-2 border-orange-500">
                                <div className="text-xs sm:text-sm font-medium text-orange-600">Answer:</div>
                                <div className="text-xs sm:text-sm text-gray-700 mt-0.5 sm:mt-1">{faq.answer}</div>
                              </div>
                            ) : canAnswerFaq ? (
                              <AnswerForm faqId={faq._id} onAnswer={handleAnswerQuestion} />
                            ) : (
                              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500 italic">Waiting for answer...</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "Reviews" && (
                  <div>
                    <h2 className="text-sm sm:text-base md:text-lg font-semibold">Student Reviews ({reviews.length})</h2>

                    <div className="mt-2 sm:mt-3 md:mt-4 space-y-2 sm:space-y-3 md:space-y-4">
                      {reviews.length === 0 ? (
                        <p className="text-gray-500 text-xs sm:text-sm">No reviews yet. Be the first to review!</p>
                      ) : (
                        reviews.map(review => (
                          <div key={review._id} className="p-2 sm:p-3 md:p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-xs sm:text-sm">{review.user.firstName} {review.user.lastName}</div>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FiStar key={`review-${review._id}-star-${i}`} className={`w-3 h-3 sm:w-4 sm:h-4 ${i < review.rating ? 'fill-orange-500 text-orange-500' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                              </div>
                              <div className="text-[10px] sm:text-xs text-gray-500 ml-2">{new Date(review.createdAt).toLocaleDateString()}</div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700 mt-1.5 sm:mt-2">{review.text}</p>
                            {userId === review.user?._id && (
                              <button onClick={() => { setReviewText(review.text); setRating(review.rating); setIsEditingReview(true); }} className="mt-1.5 sm:mt-2 text-orange-500 text-[10px] sm:text-xs hover:underline tap-target">Edit</button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {(!reviews.find(r => r.user?._id === userId) || isEditingReview) && (
                      <div className="mt-3 sm:mt-4 md:mt-6">
                        <h3 className="text-xs sm:text-sm font-medium">Leave a review</h3>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
                          <span className="text-xs sm:text-sm">Rating:</span>
                          {[1,2,3,4,5].map(star => (
                            <FiStar key={`rating-${star}`} onClick={() => setRating(star)} className={`w-4 h-4 sm:w-5 sm:h-5 cursor-pointer tap-target ${star <= rating ? 'fill-orange-500 text-orange-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="w-full mt-2 sm:mt-3 p-2 border rounded resize-none h-16 sm:h-20 md:h-24 text-xs sm:text-sm" placeholder="Share your experience..."></textarea>
                        <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                          <div className="text-[10px] sm:text-xs text-gray-500">{!user && 'You must be logged in to review.'}</div>
                          <button onClick={handlePostReview} disabled={!user} className="w-full sm:w-auto bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm disabled:opacity-50 tap-target">Submit Review</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="md:col-span-4">
          <SidebarCard 
            price={course.price} 
            lectures={course.lessons.length} 
            level={course.level} 
            language={course.language} 
            onEnroll={isEnrolled ? handleStart : handleEnroll}
            isEnrolled={isEnrolled}
            enrolling={enrolling}
          />

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="mt-3 sm:mt-4 md:mt-6">
            <div className="bg-white p-2 sm:p-3 md:p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm text-gray-500">Course Features</div>
              </div>

              <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li className="flex items-center gap-1.5 sm:gap-2"><MdOutlineQuiz className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Quizzes</li>
                <li className="flex items-center gap-1.5 sm:gap-2"><FiPlay className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Video lectures</li>
                <li className="flex items-center gap-1.5 sm:gap-2"><FiStar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Certificate</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
