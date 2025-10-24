import React, { useState, useEffect } from 'react';
import { Save, Settings } from 'lucide-react';
import { settingsAPI } from '../../services/api';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      if (response.data.length === 0) {
        // Initialize with defaults if no settings exist
        setSettings([
          {
            key: 'maxRequestSize',
            value: '50mb',
            description: 'Maximum request body size',
            category: 'upload'
          },
          {
            key: 'maxFileSize',
            value: 50,
            description: 'Maximum file size in MB',
            category: 'upload'
          }
        ]);
      } else {
        setSettings(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use defaults on error
      setSettings([
        {
          key: 'maxRequestSize',
          value: '50mb',
          description: 'Maximum request body size',
          category: 'upload'
        },
        {
          key: 'maxFileSize',
          value: 50,
          description: 'Maximum file size in MB',
          category: 'upload'
        }
      ]);
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateSettings({ settings });
      alert('Settings saved successfully! Server restart required.');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const uploadSettings = settings.filter(s => s.category === 'upload');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Settings</h3>
              <div className="space-y-4">
                {uploadSettings.map((setting) => (
                  <div key={setting.key} className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {setting.description}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">{setting.key}</p>
                    </div>
                    <div>
                      {setting.key === 'maxRequestSize' ? (
                        <select
                          value={setting.value}
                          onChange={(e) => updateSetting(setting.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="10mb">10 MB</option>
                          <option value="25mb">25 MB</option>
                          <option value="50mb">50 MB</option>
                          <option value="100mb">100 MB</option>
                          <option value="200mb">200 MB</option>
                          <option value="500mb">500 MB</option>
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={setting.value}
                          onChange={(e) => updateSetting(setting.key, parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          min="1"
                          max="1000"
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {setting.key === 'maxFileSize' && 'MB per file'}
                      {setting.key === 'maxRequestSize' && 'Total request size'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;