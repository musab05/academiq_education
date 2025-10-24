// LessonPage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { pushNavigation } from '../store/slices/navigationSlice';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import ChapterItem from '../components/lessonComponent/ChapterItem';
import LessonItem from '../components/lessonComponent/LessonItem';
import LessonModal from '../components/lessonComponent/LessonModal';
import { lessonAPI, courseAPI } from '../services/api';
import {
  setLessons,
  setChapters,
  addLesson,
  addChapter,
  updateLesson,
  updateChapter,
  deleteLesson,
  deleteChapter,
  setLoading,
  clearLessonData,
} from '../store/slices/lessonSlice';
import courseImg from '../public/images/empty-course.png';

export default function LessonPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [courseSlug, setCourseSlug] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const { currentCourseId, lessons, chapters, loading } = useSelector(
    (state) => state.lesson
  );
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();
  
  console.log('LessonPage - currentCourseId:', currentCourseId);
  console.log('LessonPage - slug:', slug);

  useEffect(() => {
    return () => {
      const lessonRoutes = ['/course-overview/', '-lesson/', '/course-preview'];
      const isLessonRoute = lessonRoutes.some(route => location.pathname.includes(route));
      if (!isLessonRoute) {
        dispatch(clearLessonData());
      }
    };
  }, [location.pathname, dispatch]);

  // Build items for DnD/outline view respecting order
  const items = [
    ...chapters.map((chapter) => ({
      ...chapter,
      id: chapter._id,
      type: 'chapter',
      children: lessons.filter((l) => l.chapter?._id === chapter._id),
      order: chapter.order !== undefined ? chapter.order : new Date(chapter.createdAt).getTime(),
    })),
    ...lessons.filter((lesson) => !lesson.chapter).map(lesson => ({
      ...lesson,
      order: lesson.order !== undefined ? lesson.order : new Date(lesson.createdAt).getTime(),
    })),
  ].sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (currentCourseId) {
      fetchLessons();
    } else {
      dispatch(clearLessonData());
    }
  }, [currentCourseId]);

  const fetchLessons = async () => {
    try {
      const response = await lessonAPI.getLessons(currentCourseId);
      dispatch(setLessons(response.data.lessons));
      dispatch(setChapters(response.data.chapters));
      setCourseSlug(response.data.course.slug);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  useEffect(() => {
    const fetchCourseStatus = async () => {
      if (!courseSlug) return;
      try {
        const response = await courseAPI.getBySlug(courseSlug);
        setIsPublished(response.data.published);
      } catch (error) {
        console.error('Error fetching course status:', error);
      }
    };
    fetchCourseStatus();
  }, [courseSlug]);

  const handlePublish = async () => {
    if (!isPublished && lessons.length === 0) {
      alert('Please add at least one lesson before publishing the course.');
      return;
    }
    try {
      await courseAPI.update(courseSlug, { published: !isPublished });
      setIsPublished(!isPublished);
    } catch (error) {
      console.error('Error publishing course:', error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleAddChapter = async () => {
    if (!currentCourseId) return;
    try {
      const response = await lessonAPI.createChapter({
        title: 'New Chapter',
        courseId: currentCourseId,
      });
      dispatch(addChapter(response.data));
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  const handleAddLesson = async (type) => {
    if (!currentCourseId) return;
    try {
      const response = await lessonAPI.createLesson({
        title: `${type} Lesson`,
        type: type.toLowerCase(),
        courseId: currentCourseId,
        chapterId: selectedChapterId,
      });
      dispatch(addLesson(response.data));
      setShowModal(false);
      setSelectedChapterId(null);
    } catch (error) {
      console.error('Error creating lesson:', error);
    }
  };

  const handleLessonTitleChange = async (id, newTitle) => {
    try {
      const response = await lessonAPI.updateLesson(id, { title: newTitle });
      dispatch(updateLesson(response.data));
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  const handleChapterTitleChange = async (id, newTitle) => {
    try {
      const response = await lessonAPI.updateChapter(id, { title: newTitle });
      dispatch(updateChapter(response.data));
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  const handleReorderLessons = (chapterId, oldIndex, newIndex) => {
    console.log('Reorder lessons:', chapterId, oldIndex, newIndex);
    // TODO: persist ordering via API
  };

  const handleDeleteLesson = async (id) => {
    try {
      await lessonAPI.deleteLesson(id);
      dispatch(deleteLesson(id));
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleDeleteChapter = async (id) => {
    try {
      await lessonAPI.deleteChapter(id);
      dispatch(deleteChapter(id));
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  // When there are no chapters and no lessons, show the centered empty state
  const hasContent = (chapters && chapters.length > 0) || (lessons && lessons.length > 0);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="max-w-4xl mx-auto">
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 sm:gap-3 mb-4 sm:mb-6">
            <button 
              onClick={() => {
                dispatch(pushNavigation(`/course-overview/${courseSlug}`));
                navigate(`/course-preview/${courseSlug}`);
              }}
              className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base tap-target"
            >
              Preview
            </button>
            <button 
              onClick={handlePublish}
              disabled={!isPublished && lessons.length === 0}
              title={!isPublished && lessons.length === 0 ? 'Add at least one lesson to publish' : ''}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base tap-target ${isPublished ? 'bg-gray-500 hover:bg-gray-600' : lessons.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>

          {hasContent ? (
            <>
              <h1 className="text-xl sm:text-2xl font-semibold mb-1">Course Outline</h1>
              <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Build your course structure.</p>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={async ({ active, over }) => {
                  if (!over || active.id === over.id) return;
                  
                  const oldIndex = items.findIndex(i => (i._id || i.id) === active.id);
                  const newIndex = items.findIndex(i => (i._id || i.id) === over.id);
                  
                  const reorderedItems = arrayMove(items, oldIndex, newIndex);
                  const updates = reorderedItems.map((item, index) => ({
                    id: item._id || item.id,
                    type: item.type === 'chapter' ? 'chapter' : 'lesson',
                    order: index
                  }));
                  
                  try {
                    await lessonAPI.reorderItems(currentCourseId, updates);
                    fetchLessons();
                  } catch (error) {
                    console.error('Error reordering:', error);
                  }
                }}
              >
                <SortableContext
                  items={items.map((i) => i._id || i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item) =>
                    item.type === 'chapter' ? (
                      <ChapterItem
                        key={item._id || item.id}
                        chapter={item}
                        onTitleChange={handleChapterTitleChange}
                        onLessonChange={handleLessonTitleChange}
                        onAddLesson={(id) => {
                          setSelectedChapterId(id);
                          setShowModal(true);
                        }}
                        onReorderLessons={handleReorderLessons}
                        onDeleteLesson={handleDeleteLesson}
                        onDeleteChapter={handleDeleteChapter}
                      />
                    ) : (
                      <LessonItem
                        key={item._id || item.id}
                        lesson={item}
                        onChange={handleLessonTitleChange}
                        onDelete={handleDeleteLesson}
                      />
                    )
                  )}
                </SortableContext>
              </DndContext>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setSelectedChapterId(null);
                    setShowModal(true);
                  }}
                  className="border border-orange-500 text-orange-500 px-4 py-2 rounded hover:bg-orange-50 text-sm tap-target"
                >
                  + Add Lesson
                </button>
                <button
                  onClick={handleAddChapter}
                  className="border text-sm px-4 py-2 rounded hover:bg-gray-200 tap-target"
                >
                  + Add Chapter
                </button>
              </div>
            </>
          ) : (
            /* Empty state UI: centered illustration + heading + two buttons */
            <section className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                {/* Illustration: put your image in public/images/empty-course.png */}
                <img
                  src={courseImg}
                  alt="Create course"
                  className="mx-auto w-24 sm:w-32 md:w-36 h-auto mb-4 sm:mb-6 opacity-90"
                />

                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
                  Create your course!
                </h2>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">
                  Begin building your course by creating a lesson or chapter.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                  <button
                    onClick={() => {
                      setSelectedChapterId(null);
                      setShowModal(true);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-orange-400 text-orange-600 px-5 py-2 rounded-lg hover:bg-orange-50 shadow-sm text-sm tap-target"
                  >
                    {/* plus icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Lesson
                  </button>

                  <button
                    onClick={handleAddChapter}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-100 shadow-sm text-sm tap-target"
                  >
                    {/* list icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M3 6.5A1.5 1.5 0 114 3h12a1.5 1.5 0 110 3H4a.5.5 0 01-.5-.5zM3 11.5A1.5 1.5 0 114 8h12a1.5 1.5 0 110 3H4a.5.5 0 01-.5-.5zM3 16.5A1.5 1.5 0 114 13h12a1.5 1.5 0 110 3H4a.5.5 0 01-.5-.5z" />
                    </svg>
                    Add Chapter
                  </button>
                </div>
              </div>
            </section>
          )}

          <LessonModal
            open={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedChapterId(null);
            }}
            onSelect={handleAddLesson}
          />
        </div>
        </main>
      </div>
    </div>
  );
}
