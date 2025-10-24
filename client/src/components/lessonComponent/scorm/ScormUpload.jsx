import React from 'react';
import { FileArchive, Loader2 } from 'lucide-react';

const ScormUpload = ({ uploading, onFileUpload }) => {
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-16 text-center relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {uploading ? (
        <div className="space-y-4">
          <Loader2 className="mx-auto w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-gray-600">Processing SCORM package...</p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <FileArchive className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Upload SCORM Package</h3>
            <p className="text-gray-500">Drop your SCORM ZIP file here or click to browse</p>
            <p className="text-sm text-gray-400 mt-2">Supports SCORM 1.2 and SCORM 2004</p>
          </div>
          
          <input
            type="file"
            accept=".zip"
            onChange={(e) => onFileUpload(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

export default ScormUpload;