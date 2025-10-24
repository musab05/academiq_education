import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

const AccessSettingsPage = () => {
  const { slug } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState({ accessType: 'public', requireApproval: false, price: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get(`/api/courses/slug/${slug}`);
        if (response.data) setSettings({ accessType: response.data.accessType || 'public', requireApproval: response.data.requireApproval || false, price: response.data.price || 0 });
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Access Settings</h1>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Access Type</label>
                <select value={settings.accessType} onChange={(e) => setSettings(prev => ({ ...prev, accessType: e.target.value }))} className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {settings.accessType === 'paid' && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Price ($)</label>
                  <input type="number" value={settings.price} onChange={(e) => setSettings(prev => ({ ...prev, price: parseFloat(e.target.value) }))} className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                </div>
              )}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Require Approval</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Manually approve enrollments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 tap-target">
                  <input type="checkbox" checked={settings.requireApproval} onChange={(e) => setSettings(prev => ({ ...prev, requireApproval: e.target.checked }))} className="sr-only peer" />
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

export default AccessSettingsPage;
