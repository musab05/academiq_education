import React from 'react';

const VideoSettings = ({ videoData, onChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Video Settings</h3>
      <div className="flex gap-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={videoData.autoplay}
            onChange={(e) => onChange('autoplay', e.target.checked)}
            className="mr-2 rounded"
          />
          <span className="text-sm text-gray-700">Autoplay</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={videoData.allowDownload}
            onChange={(e) => onChange('allowDownload', e.target.checked)}
            className="mr-2 rounded"
          />
          <span className="text-sm text-gray-700">Allow Download</span>
        </label>
      </div>
    </div>
  );
};

export default VideoSettings;