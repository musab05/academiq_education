import React from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';

const ScormPreview = ({ scormData, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="space-y-6">
        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">SCORM Package Uploaded</h3>
          <p className="text-lg text-gray-700 font-medium">{scormData.title}</p>
          <p className="text-sm text-gray-500 mt-1">Version: {scormData.version}</p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => window.open(scormData.launchUrl, '_blank')}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
          >
            Preview SCORM
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 border border-red-300 text-red-700 px-4 py-2 rounded-md hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Package
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScormPreview;