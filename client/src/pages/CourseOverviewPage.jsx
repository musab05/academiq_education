import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Save, ArrowLeft, Image, X, CheckCircle, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import CategorySelector from '../components/course/CategorySelector';
import LevelSelector from '../components/course/LevelSelector';
import DepartmentSelector from '../components/common/DepartmentSelector';
import { courseAPI, categoriesAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useSelector, useDispatch } from 'react-redux';
import { setCourses } from '../store/slices/courseSlice';

const CourseOverviewPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { courses } = useSelector(state => state.course);
  const { currentCourseId } = useSelector(state => state.lesson);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    categories: [],
    level: 'beginner',
    department: ''
  });

  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCourse();
    loadCategories();
  }, [currentCourseId]);

  const loadCourse = async () => {
    try {
      if (!currentCourseId) {
        setLoading(false);
        return;
      }

      const courseFromState = courses.find(c => c._id === currentCourseId);
      if (courseFromState) {
        setCourseData({
          title: courseFromState.title || '',
          description: courseFromState.description || '',
          thumbnail: courseFromState.thumbnail || '',
          categories: courseFromState.categories?.map(cat => cat._id || cat) || [],
          level: courseFromState.level || 'beginner',
          department: courseFromState.department?._id || courseFromState.department || ''
        });
        setThumbnailPreview(courseFromState.thumbnail || '');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      showNotification({ type: 'error', message: 'Failed to load course' });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.list();
      setCategories(response.data.flat || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };



  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetThumbnail = () => {
    setThumbnailFile(null);
    const currentCourse = courses.find(c => c._id === currentCourseId);
    if (currentCourse) {
      setThumbnailPreview(currentCourse.thumbnail || '');
      setCourseData(prev => ({ ...prev, thumbnail: currentCourse.thumbnail || '' }));
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    setCourseData(prev => ({ ...prev, thumbnail: '' }));
  };

  const handlePublish = async () => {
    const currentCourse = courses.find(c => c._id === currentCourseId);
    if (!currentCourse) return;

    if (!courseData.title.trim()) {
      showNotification({ type: 'error', message: 'Course title is required before publishing' });
      return;
    }

    if (!courseData.description.trim()) {
      showNotification({ type: 'error', message: 'Course description is required before publishing' });
      return;
    }

    if (!courseData.thumbnail) {
      showNotification({ type: 'error', message: 'Course thumbnail is required before publishing' });
      return;
    }

    if (courseData.categories.length === 0) {
      showNotification({ type: 'error', message: 'At least one category is required before publishing' });
      return;
    }

    setPublishing(true);
    try {
      const response = await courseAPI.update(currentCourse.slug, { published: true });
      const updatedCourses = courses.map(course => 
        course._id === currentCourseId ? { ...course, published: true } : course
      );
      dispatch(setCourses(updatedCourses));
      showNotification({ type: 'success', message: 'Course published successfully!' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to publish course' });
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    const currentCourse = courses.find(c => c._id === currentCourseId);
    if (!currentCourse) return;

    setDeleting(true);
    try {
      await courseAPI.delete(currentCourse.slug);
      const updatedCourses = courses.filter(course => course._id !== currentCourseId);
      dispatch(setCourses(updatedCourses));
      showNotification({ type: 'success', message: 'Course deleted successfully' });
      navigate('/courses');
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to delete course' });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSave = async () => {
    if (!courseData.title.trim()) {
      showNotification({ type: 'error', message: 'Course title is required' });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('level', courseData.level);
      formData.append('categories', JSON.stringify(courseData.categories));
      formData.append('department', courseData.department);
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const currentCourse = courses.find(c => c._id === currentCourseId);
      if (currentCourse) {
        const response = await courseAPI.update(currentCourse.slug, formData);
        
        // Update Redux state
        const updatedCourses = courses.map(course => 
          course._id === currentCourseId ? response.data : course
        );
        dispatch(setCourses(updatedCourses));
        
        // Update thumbnail preview
        if (response.data.thumbnail) {
          setThumbnailPreview(response.data.thumbnail);
        }
      }
      showNotification({ type: 'success', message: 'Course updated successfully' });
    } catch (error) {
      console.error('Error saving course:', error);
      showNotification({ type: 'error', message: 'Failed to save course' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }}
          mode="course-overview"
          title="Course Overview"
          onBack={() => {
            const currentCourse = courses.find(c => c._id === currentCourseId);
            if (currentCourse) {
              navigate(`/course-overview/${currentCourse.slug}`);
            }
          }}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">


            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-orange-200">
                <div className="max-w-3xl">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Course Overview</h1>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    Customize your course settings, manage content details, and configure learning preferences. 
                    Make your course stand out with compelling descriptions and proper categorization.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
                {/* Main Content */}
                <div className="xl:col-span-3 space-y-6 sm:space-y-8">
                  {/* Basic Information Card */}
                  <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
                    <div className="mb-6 sm:mb-8">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Basic Information</h2>
                      <p className="text-sm sm:text-base text-gray-600">Set up the fundamental details of your course</p>
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                      {/* Course Title */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
                          Course Title *
                        </label>
                        <input
                          type="text"
                          value={courseData.title}
                          onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base sm:text-lg font-medium bg-gray-50 focus:bg-white transition-colors"
                          placeholder="Enter an engaging course title..."
                        />
                      </div>

                      {/* Course Description */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
                          Course Description
                        </label>
                        <textarea
                          value={courseData.description}
                          onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                          rows={6}
                          className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                          placeholder="Describe what students will learn, the skills they'll gain, and what makes this course unique..."
                        />
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">Help students understand the value and outcomes of your course</p>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Card */}
                  <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
                    <div className="mb-6 sm:mb-8">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Course Thumbnail</h2>
                      <p className="text-sm sm:text-base text-gray-600">Upload an eye-catching image that represents your course</p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-12 bg-gray-50 hover:bg-gray-100 transition-colors">
                      {thumbnailPreview ? (
                        <div className="relative max-w-md mx-auto">
                          <img
                            src={thumbnailPreview}
                            alt="Course thumbnail"
                            className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg sm:rounded-xl shadow-lg"
                          />
                          <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 flex gap-1.5 sm:gap-2">
                            <button
                              onClick={resetThumbnail}
                              className="p-1.5 sm:p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors shadow-lg tap-target"
                              title="Reset to original"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              onClick={removeThumbnail}
                              className="p-1.5 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg tap-target"
                              title="Remove thumbnail"
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Image className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Upload Course Thumbnail</h3>
                          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto px-4">Choose a high-quality image that will attract students to your course</p>
                          <label className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500 text-white rounded-lg sm:rounded-xl hover:bg-orange-600 cursor-pointer transition-colors font-medium shadow-sm text-sm sm:text-base tap-target">
                            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                            Choose Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailChange}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">PNG, JPG up to 50MB • Recommended: 1280x720px</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="xl:col-span-1 space-y-4 sm:space-y-6">
                  {/* Category Selection */}
                  <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Category</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Help students find your course</p>
                    </div>
                    <CategorySelector
                      categories={categories}
                      selected={courseData.categories}
                      onSelect={(categoryIds) => setCourseData(prev => ({ ...prev, categories: categoryIds }))}
                    />
                  </div>

                  {/* Level Selection */}
                  <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Difficulty Level</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Set appropriate expectations</p>
                    </div>
                    <LevelSelector
                      selected={courseData.level}
                      onSelect={(level) => setCourseData(prev => ({ ...prev, level }))}
                    />
                  </div>

                  {/* Department Selection */}
                  <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Department</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Assign this course to a department</p>
                    </div>
                    <DepartmentSelector
                      selected={courseData.department}
                      onSelect={(departmentId) => setCourseData(prev => ({ ...prev, department: departmentId }))}
                      placeholder="Select a department for this course"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors text-sm sm:text-base tap-target"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Delete Course
                </button>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm sm:text-base tap-target ${
                      publishing
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                    }`}
                  >
                    {publishing ? (
                      <>
                        <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span className="hidden sm:inline">Publishing...</span>
                        <span className="sm:hidden">Publishing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        Publish Course
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium flex items-center justify-center gap-2 sm:gap-3 transition-colors text-sm sm:text-base tap-target ${
                      saving 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span className="hidden sm:inline">Saving Changes...</span>
                        <span className="sm:hidden">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-6 sm:p-8 max-w-md w-full">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Delete Course?</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Are you sure you want to delete this course? This action cannot be undone and all course data will be permanently removed.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base tap-target"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm sm:text-base tap-target ${
                  deleting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } transition-colors`}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseOverviewPage;
