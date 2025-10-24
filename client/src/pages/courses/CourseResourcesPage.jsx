import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, Trash2, Loader } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { lessonAPI, courseAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentCourse } from '../../store/slices/lessonSlice';

const CourseResourcesPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { courses } = useSelector(state => state.course);
  const { currentCourseId } = useSelector(state => state.lesson);
  const [courseId, setCourseId] = useState(null);
  
  console.log('CourseResourcesPage - slug:', slug);
  console.log('CourseResourcesPage - currentCourseId from Redux:', currentCourseId);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Fetching course by slug:', slug);
        const response = await courseAPI.getBySlug(slug);
        console.log('Course fetched:', response.data);
        setCourseId(response.data._id);
        dispatch(setCurrentCourse(response.data._id));
      } catch (error) {
        console.error('Error fetching course:', error);
        showNotification({ type: 'error', message: 'Failed to load course' });
      }
    };
    
    if (slug) {
      fetchCourse();
    } else if (currentCourseId) {
      console.log('Using currentCourseId from Redux:', currentCourseId);
      setCourseId(currentCourseId);
    } else {
      console.log('No slug or currentCourseId available');
      showNotification({ type: 'warning', message: 'Please select a course first' });
    }
  }, [slug, currentCourseId]);

  useEffect(() => {
    if (courseId) {
      fetchResources();
    }
  }, [courseId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await lessonAPI.getLessons(courseId);
      const lessons = response.data.lessons || [];
      
      const allResources = [];
      lessons.forEach(lesson => {
        if (lesson.attachments && lesson.attachments.length > 0) {
          lesson.attachments.forEach(attachment => {
            allResources.push({
              ...attachment,
              lessonId: lesson._id,
              lessonTitle: lesson.title,
              lessonType: lesson.type
            });
          });
        }
      });
      
      setResources(allResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      showNotification({ type: 'error', message: 'Failed to load resources' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId, attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    setDeleting(attachmentId);
    try {
      await lessonAPI.deleteAttachment(lessonId, attachmentId);
      setResources(resources.filter(r => r._id !== attachmentId));
      showNotification({ type: 'success', message: 'Resource deleted successfully' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to delete resource' });
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (filePath, fileName) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconClass = 'w-10 h-10 rounded-lg flex items-center justify-center';
    
    if (['pdf'].includes(ext)) return <div className={`${iconClass} bg-red-100 text-red-600`}><FileText /></div>;
    if (['doc', 'docx'].includes(ext)) return <div className={`${iconClass} bg-blue-100 text-blue-600`}><FileText /></div>;
    if (['xls', 'xlsx'].includes(ext)) return <div className={`${iconClass} bg-green-100 text-green-600`}><FileText /></div>;
    if (['ppt', 'pptx'].includes(ext)) return <div className={`${iconClass} bg-orange-100 text-orange-600`}><FileText /></div>;
    if (['zip', 'rar'].includes(ext)) return <div className={`${iconClass} bg-purple-100 text-purple-600`}><FileText /></div>;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <div className={`${iconClass} bg-pink-100 text-pink-600`}><FileText /></div>;
    return <div className={`${iconClass} bg-gray-100 text-gray-600`}><FileText /></div>;
  };

  if (!courseId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header mode="course-overview" title="Course Resources" onMenuClick={() => { setCollapsed(!collapsed); setSidebarOpen(true); }} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Course Resources</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">All attachments from course lessons</p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <Loader className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-orange-500" />
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
                  <p className="text-sm sm:text-base text-gray-500">Resources attached to lessons will appear here</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {resources.map((resource) => (
                    <div
                      key={resource._id}
                      className="flex items-center justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        <div className="hidden sm:block">{getFileIcon(resource.fileName)}</div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">{resource.fileName}</h3>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-3 mt-1">
                            <span className="text-xs text-gray-500">{formatFileSize(resource.fileSize)}</span>
                            <span className="hidden sm:inline text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 truncate">From: {resource.lessonTitle}</span>
                            <span className="hidden sm:inline text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 capitalize">{resource.lessonType}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleDownload(resource.filePath, resource.fileName)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tap-target"
                          title="Download"
                        >
                          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(resource.lessonId, resource._id)}
                          disabled={deleting === resource._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 tap-target"
                          title="Delete"
                        >
                          {deleting === resource._id ? (
                            <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseResourcesPage;
