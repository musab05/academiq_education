import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import DepartmentSelector from '../../components/common/DepartmentSelector';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

const GeneralSettingsPage = () => {
  const { slug } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState({ published: false, featured: false, allowComments: true, department: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get(`/api/courses/slug/${slug}`);
        if (response.data) setSettings({ 
          published: response.data.published || false, 
          featured: response.data.featured || false, 
          allowComments: response.data.allowComments !== false,
          department: response.data.department?._id || response.data.department || ''
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/courses/slug/${slug}`, settings);
      showNotification({ type: 'success', message: 'Settings saved successfully!' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">General Settings</h1>
            
            {/* Department Assignment */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Course Assignment</h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <DepartmentSelector
                    selected={settings.department}
                    onSelect={(departmentId) => setSettings(prev => ({ ...prev, department: departmentId }))}
                    placeholder="Select a department for this course"
                    className="max-w-md"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Assign this course to a specific department for better organization and access control.
                  </p>
                </div>
              </div>
            </div>

            {/* Course Visibility Settings */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Course Visibility</h2>
              {[
                { key: 'published', title: 'Publish Course', desc: 'Make this course visible to students' },
                { key: 'featured', title: 'Featured Course', desc: 'Display on homepage' },
                { key: 'allowComments', title: 'Allow Comments', desc: 'Enable student discussions' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 tap-target">
                    <input type="checkbox" checked={settings[item.key]} onChange={(e) => setSettings(prev => ({ ...prev, [item.key]: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4 sm:mt-6">
              <button onClick={handleSave} disabled={saving} className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-sm sm:text-base tap-target ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white`}>
                {saving ? <><div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>Saving...</> : <><Save className="w-4 h-4 sm:w-5 sm:h-5" />Save</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
