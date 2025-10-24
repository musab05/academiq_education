import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

const CompletionSettingsPage = () => {
  const { slug } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState({ completionCriteria: 'all_lessons', minimumScore: 70, trackProgress: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get(`/api/courses/slug/${slug}`);
        if (response.data) setSettings({ completionCriteria: response.data.completionCriteria || 'all_lessons', minimumScore: response.data.minimumScore || 70, trackProgress: response.data.trackProgress !== false });
      } catch (error) {
        console.error('Error:', error);
      }
    };
    loadSettings();
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/courses/slug/${slug}`, settings);
      showNotification({ type: 'success', message: 'Settings saved!' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Completion Settings</h1>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Completion Criteria</label>
                <select value={settings.completionCriteria} onChange={(e) => setSettings(prev => ({ ...prev, completionCriteria: e.target.value }))} className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="all_lessons">Complete All Lessons</option>
                  <option value="minimum_score">Achieve Minimum Score</option>
                  <option value="final_exam">Pass Final Exam</option>
                </select>
              </div>
              {settings.completionCriteria === 'minimum_score' && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Minimum Score (%)</label>
                  <input type="number" min="0" max="100" value={settings.minimumScore} onChange={(e) => setSettings(prev => ({ ...prev, minimumScore: parseInt(e.target.value) }))} className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                </div>
              )}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Track Progress</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Monitor student progress</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 tap-target">
                  <input type="checkbox" checked={settings.trackProgress} onChange={(e) => setSettings(prev => ({ ...prev, trackProgress: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
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

export default CompletionSettingsPage;
