import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { instituteAPI } from '../../services/api';

const InstituteSettingsModal = ({ institute, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [branding, setBranding] = useState({
    primaryColor: institute.branding?.primaryColor || '#f97316',
    secondaryColor: institute.branding?.secondaryColor || '#ef4444',
    customDomain: institute.branding?.customDomain || '',
  });

  const [settings, setSettings] = useState({
    autoEnrollByDomain: institute.settings?.autoEnrollByDomain ?? true,
    allowCrossCourseSharing: institute.settings?.allowCrossCourseSharing ?? false,
  });

  const [limits, setLimits] = useState({
    maxUsers: institute.limits?.maxUsers || 1000,
    maxCourses: institute.limits?.maxCourses || 100,
    storageGB: institute.limits?.storageGB || 50,
  });

  const [subscription, setSubscription] = useState({
    plan: institute.subscription?.plan || 'free',
    status: institute.subscription?.status || 'active',
  });

  const handleSave = async () => {
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'branding') {
        await instituteAPI.updateBranding(institute._id, branding);
      } else if (activeTab === 'settings') {
        await instituteAPI.updateSettings(institute._id, settings);
      } else if (activeTab === 'limits') {
        await instituteAPI.updateLimits(institute._id, limits);
      } else if (activeTab === 'subscription') {
        await instituteAPI.updateSubscription(institute._id, subscription);
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Institute Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg tap-target">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4 sm:px-6 overflow-x-auto">
          {['branding', 'settings', 'limits', 'subscription'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium capitalize whitespace-nowrap tap-target ${
                activeTab === tab
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="w-full h-10 sm:h-12 rounded-lg border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="w-full h-10 sm:h-12 rounded-lg border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Custom Domain</label>
                <input
                  type="text"
                  value={branding.customDomain}
                  onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg"
                  placeholder="vit.academiq.com"
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <label className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer tap-target">
                <input
                  type="checkbox"
                  checked={settings.autoEnrollByDomain}
                  onChange={(e) => setSettings({ ...settings, autoEnrollByDomain: e.target.checked })}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 rounded mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-base font-medium">Auto-enroll by Domain</div>
                  <div className="text-xs sm:text-sm text-gray-600">Automatically assign users based on email domain</div>
                </div>
              </label>
              <label className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer tap-target">
                <input
                  type="checkbox"
                  checked={settings.allowCrossCourseSharing}
                  onChange={(e) => setSettings({ ...settings, allowCrossCourseSharing: e.target.checked })}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 rounded mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-base font-medium">Allow Cross-Course Sharing</div>
                  <div className="text-xs sm:text-sm text-gray-600">Share courses with other institutes</div>
                </div>
              </label>
            </div>
          )}

          {activeTab === 'limits' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Max Users</label>
                <input
                  type="number"
                  value={limits.maxUsers}
                  onChange={(e) => setLimits({ ...limits, maxUsers: parseInt(e.target.value) })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Max Courses</label>
                <input
                  type="number"
                  value={limits.maxCourses}
                  onChange={(e) => setLimits({ ...limits, maxCourses: parseInt(e.target.value) })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Storage (GB)</label>
                <input
                  type="number"
                  value={limits.storageGB}
                  onChange={(e) => setLimits({ ...limits, storageGB: parseInt(e.target.value) })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Plan</label>
                <select
                  value={subscription.plan}
                  onChange={(e) => setSubscription({ ...subscription, plan: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={subscription.status}
                  onChange={(e) => setSubscription({ ...subscription, status: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 tap-target"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 tap-target"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstituteSettingsModal;
