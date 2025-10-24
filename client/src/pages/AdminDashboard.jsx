import React, { useState } from 'react';
import { Plus, Book, Users, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import SystemSettings from '../components/admin/SystemSettings';

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  const handleCreateCourse = () => {
    if (courseTitle.trim() && courseDescription.trim()) {
      console.log('Course Created:', { courseTitle, courseDescription });
      setCourseTitle('');
      setCourseDescription('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#FF5A00] mb-6">
            Admin Panel
          </h2>
          <nav className="space-y-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 w-full text-left ${activeTab === 'dashboard' ? 'text-[#FF5A00]' : 'text-gray-700 hover:text-[#FF5A00]'}`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 w-full text-left ${activeTab === 'courses' ? 'text-[#FF5A00]' : 'text-gray-700 hover:text-[#FF5A00]'}`}
            >
              <Book className="w-5 h-5" /> Courses
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 w-full text-left ${activeTab === 'users' ? 'text-[#FF5A00]' : 'text-gray-700 hover:text-[#FF5A00]'}`}
            >
              <Users className="w-5 h-5" /> Users
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 w-full text-left ${activeTab === 'settings' ? 'text-[#FF5A00]' : 'text-gray-700 hover:text-[#FF5A00]'}`}
            >
              <Settings className="w-5 h-5" /> Settings
            </button>
          </nav>
        </div>
        <button className="flex items-center gap-2 text-red-600 hover:underline">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'courses' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FF5A00] text-white px-4 py-2 rounded hover:bg-[#ff8f52] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Course
              </button>
            </div>
            <div className="border rounded-lg p-4 bg-white text-center text-gray-500">
              No courses available. Click "Create Course" to add one.
            </div>
          </>
        )}
        
        {activeTab === 'settings' && <SystemSettings />}
        
        {activeTab === 'dashboard' && (
          <div className="text-center text-gray-500 mt-20">
            Dashboard content coming soon...
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="text-center text-gray-500 mt-20">
            User management coming soon...
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
              <h2 className="text-xl font-bold mb-4">Create New Course</h2>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={e => setCourseTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
                placeholder="Enter course title"
              />

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={courseDescription}
                onChange={e => setCourseDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
                placeholder="Enter course description"
              ></textarea>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCourse}
                  className="px-4 py-2 bg-[#FF5A00] text-white rounded hover:bg-[#ff8f52]"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
