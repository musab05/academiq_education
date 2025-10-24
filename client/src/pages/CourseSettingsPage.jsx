import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Save, Award } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNotification } from '../context/NotificationContext';
import { useSelector } from 'react-redux';
import api from '../services/api';

const CourseSettingsPage = () => {
  const { slug } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showNotification } = useNotification();
  const { template } = useSelector((state) => state.certificate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState({
    certificateEnabled: false,
    certificateTemplateId: null,
  });

  useEffect(() => {
    loadCourseSettings();
    loadTemplates();
  }, [slug]);

  const loadCourseSettings = async () => {
    try {
      const response = await api.get(`/api/courses/slug/${slug}`);
      if (response.data) {
        setSettings({
          certificateEnabled: response.data.certificateEnabled || false,
          certificateTemplateId: response.data.certificateTemplate || null,
        });
      }
    } catch (error) {
      console.error('Error loading course settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await api.get('/api/certificates/template');
      if (response.data) {
        setTemplates([response.data]);
        if (!settings.certificateTemplateId) {
          setSettings(prev => ({ ...prev, certificateTemplateId: response.data._id }));
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/courses/slug/${slug}`, {
        certificateEnabled: settings.certificateEnabled,
        certificateTemplate: settings.certificateTemplateId,
      });
      showNotification({ type: 'success', message: 'Settings saved successfully!' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Course Settings</h1>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Certificate Settings</h2>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Enable Certificate</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Award certificates to students who complete this course</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 tap-target">
                    <input
                      type="checkbox"
                      checked={settings.certificateEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, certificateEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {settings.certificateEnabled && (
                  <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                      Certificate Template
                    </label>
                    {templates.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="grid grid-cols-1 gap-2 sm:gap-3">
                          {templates.map((tmpl, index) => (
                            <div
                              key={tmpl._id}
                              onClick={() => setSettings(prev => ({ ...prev, certificateTemplateId: tmpl._id }))}
                              className={`relative p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all tap-target ${
                                settings.certificateTemplateId === tmpl._id
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-orange-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  settings.certificateTemplateId === tmpl._id
                                    ? 'border-orange-500 bg-orange-500'
                                    : 'border-gray-300'
                                }`}>
                                  {settings.certificateTemplateId === tmpl._id && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm sm:text-base font-medium text-gray-900">Certificate Template {index + 1}</p>
                                  <p className="text-xs sm:text-sm text-gray-600">{tmpl.fields?.length || 0} fields configured</p>
                                </div>
                                <Award className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${
                                  settings.certificateTemplateId === tmpl._id ? 'text-orange-500' : 'text-gray-400'
                                }`} />
                              </div>
                            </div>
                          ))}
                        </div>
                        {settings.certificateTemplateId && (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-medium text-gray-900">Template Selected</p>
                              <p className="text-xs sm:text-sm text-gray-600">Certificate will be auto-generated on course completion</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-yellow-800">No certificate template found. Please create one in the Certificate Designer.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-sm sm:text-base transition-colors tap-target ${
                  saving 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSettingsPage;
