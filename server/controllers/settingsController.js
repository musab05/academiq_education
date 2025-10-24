import SystemSettings from '../models/SystemSettings.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    for (const setting of settings) {
      await SystemSettings.findOneAndUpdate(
        { key: setting.key },
        { value: setting.value },
        { upsert: true }
      );
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const initializeSettings = async (req, res) => {
  try {
    const defaultSettings = [
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
    ];

    for (const setting of defaultSettings) {
      await SystemSettings.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true }
      );
    }

    res.json({ message: 'Default settings initialized' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};