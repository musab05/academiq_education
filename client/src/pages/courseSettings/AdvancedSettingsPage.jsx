import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useNotification } from '../../context/NotificationContext';

const AdvancedSettingsPage = () => {
  const { slug } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState({ enableAnalytics: true, allowDownloads: false, watermarkContent: false });

  const handleSave = () => {
    showNotification({ type: 'success', message: 'Settings saved!' });
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(true); }} />
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Advanced Settings</h1>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
              {[
                { key: 'enableAnalytics', title: 'Enable Analytics', desc: 'Track detailed course analytics' },
                { key: 'allowDownloads', title: 'Allow Downloads', desc: 'Let students download content' },
                { key: 'watermarkContent', title: 'Watermark Content', desc: 'Add watermark to materials' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</h3>
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

export default AdvancedSettingsPage;
