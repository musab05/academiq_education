import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useNotification } from '../../context/NotificationContext';

const GradingSettingsPage = () => {
  const { slug } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState({ gradingScale: 'percentage', passingGrade: 60, showGrades: true });

  const handleSave = () => {
    showNotification({ type: 'success', message: 'Settings saved!' });
  };

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      <motion.div animate={{ width: sidebarCollapsed ? '5rem' : '18rem' }} transition={{ duration: 0.3 }} className="hidden lg:block sticky top-0 h-screen overflow-y-auto bg-white shadow-lg">
        <Sidebar collapsed={sidebarCollapsed} />
      </motion.div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(true); }} />
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Grading Settings</h1>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Grading Scale</label>
                <select value={settings.gradingScale} onChange={(e) => setSettings(prev => ({ ...prev, gradingScale: e.target.value }))} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm sm:text-base tap-target">
                  <option value="percentage">Percentage (0-100)</option>
                  <option value="letter">Letter Grade (A-F)</option>
                  <option value="points">Points</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Passing Grade (%)</label>
                <input type="number" min="0" max="100" value={settings.passingGrade} onChange={(e) => setSettings(prev => ({ ...prev, passingGrade: parseInt(e.target.value) }))} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm sm:text-base tap-target" />
              </div>
              <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Show Grades to Students</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Display grades immediately</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 tap-target">
                  <input type="checkbox" checked={settings.showGrades} onChange={(e) => setSettings(prev => ({ ...prev, showGrades: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
            <div className="flex justify-end mt-4 sm:mt-6">
              <button onClick={handleSave} className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white tap-target">
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingSettingsPage;
