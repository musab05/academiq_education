import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const VideoUpload = ({ uploading, onFileUpload, onUrlSubmit }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  
  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    
    // YouTube watch URL to embed
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    
    // YouTube live URL to embed
    const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
    if (liveMatch) {
      return `https://www.youtube.com/embed/${liveMatch[1]}`;
    }
    
    // Already embed URL or other URL
    return url;
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4 mb-6">
      <div 
        className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-16 text-center relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Uploading video...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Drop video here or click to upload</h3>
              <p className="text-gray-500">Supports MP4, WebM, AVI and other video formats</p>
            </div>
            
            <input
              type="file"
              accept="video/*"
              onChange={(e) => onFileUpload(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        )}
      </div>
      
      <div className="text-center">
        <div className="text-gray-400 text-sm mb-3">or</div>
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="url"
            placeholder="Paste YouTube embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && videoUrl.trim()) {
                const embedUrl = convertToEmbedUrl(videoUrl.trim());
                if (embedUrl.includes('youtube.com/embed/') || embedUrl.includes('vimeo.com') || embedUrl.startsWith('http')) {
                  onUrlSubmit(embedUrl);
                  setVideoUrl('');
                  setUrlError('');
                } else {
                  setUrlError('Invalid video URL');
                }
              }
            }}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => {
              if (videoUrl.trim()) {
                const embedUrl = convertToEmbedUrl(videoUrl.trim());
                if (embedUrl.includes('youtube.com/embed/') || embedUrl.includes('vimeo.com') || embedUrl.startsWith('http')) {
                  onUrlSubmit(embedUrl);
                  setVideoUrl('');
                  setUrlError('');
                } else {
                  setUrlError('Invalid video URL');
                }
              }
            }}
            disabled={!videoUrl.trim()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
        {urlError && (
          <p className="text-red-500 text-sm mt-2 text-center">{urlError}</p>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;