import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { lessonAPI, courseAPI } from '../services/api';

const AssignmentsListPage = () => {
  const { slug } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { courses } = useSelector((state) => state.course);

  useEffect(() => {
    fetchAssignments();
  }, [slug]);

  const fetchAssignments = async () => {
    try {
      const course = courses.find(c => c.slug === slug);
      if (course) {
        const lessonsRes = await lessonAPI.getLessons(course._id);
        const lessons = Array.isArray(lessonsRes.data) ? lessonsRes.data : lessonsRes.data.lessons || [];
        setAssignments(lessons.filter(l => l.type === 'assignment'));
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => {
          if (window.innerWidth >= 1024) {
            setSidebarCollapsed(!sidebarCollapsed);
          } else {
            setSidebarOpen(true);
          }
        }} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
              <p className="text-sm sm:text-base text-gray-600">Grade and manage assignment submissions</p>
            </div>

            {assignments.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500">No assignments found</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  onClick={() => navigate(`/course-overview/${slug}/assignment/${assignment._id}/grade`)}
                  className="tap-target bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer p-4 sm:p-6 border border-gray-200"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 break-words">{assignment.title}</h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>View Submissions</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsListPage;
