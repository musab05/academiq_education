import React from 'react';
import DatePicker from './DatePicker';

const AssignmentSettings = ({ settings, onUpdate }) => {
  const handleDateChange = (date) => {
    onUpdate({ dueDate: date });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <DatePicker
            label="Due Date"
            value={settings.dueDate}
            onChange={handleDateChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Points
          </label>
          <input
            type="number"
            value={settings.maxPoints || 100}
            onChange={(e) => onUpdate({ maxPoints: parseInt(e.target.value) || 100 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max File Size (MB)
          </label>
          <input
            type="number"
            value={settings.maxFileSize || 10}
            onChange={(e) => onUpdate({ maxFileSize: parseInt(e.target.value) || 10 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            min="1"
            max="500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed File Types
          </label>
          <select
            multiple
            value={settings.allowedFileTypes || []}
            onChange={(e) => onUpdate({ allowedFileTypes: Array.from(e.target.selectedOptions, option => option.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="pdf">PDF</option>
            <option value="doc">DOC</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="zip">ZIP</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowLateSubmission"
            checked={settings.allowLateSubmission || false}
            onChange={(e) => onUpdate({ allowLateSubmission: e.target.checked })}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="allowLateSubmission" className="ml-2 text-sm text-gray-700">
            Allow Late Submission
          </label>
        </div>

        {settings.allowLateSubmission && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Late Penalty (% per day)
            </label>
            <input
              type="number"
              value={settings.latePenalty || 10}
              onChange={(e) => onUpdate({ latePenalty: parseInt(e.target.value) || 10 })}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min="0"
              max="100"
            />
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="groupAssignment"
            checked={settings.groupAssignment || false}
            onChange={(e) => onUpdate({ groupAssignment: e.target.checked })}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="groupAssignment" className="ml-2 text-sm text-gray-700">
            Group Assignment
          </label>
        </div>

        {settings.groupAssignment && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Group Size
            </label>
            <input
              type="number"
              value={settings.maxGroupSize || 1}
              onChange={(e) => onUpdate({ maxGroupSize: parseInt(e.target.value) || 1 })}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min="1"
              max="10"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSettings;