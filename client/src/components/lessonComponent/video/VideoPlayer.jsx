import React from 'react';

const VideoPlayer = ({ videoData, onRemove }) => {
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // YouTube URL conversion
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        return url; // Already in embed format
      }
      
      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
    }
    
    // Vimeo URL conversion
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
    
    return url;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="aspect-video bg-black">
        {videoData.sourceType === 'link' ? (
          <iframe
            width="100%"
            height="100%"
            src={getEmbedUrl(videoData.videoUrl)}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <video
            width="100%"
            height="100%"
            controls
            src={videoData.videoUrl}
            className="w-full h-full"
          />
        )}
      </div>
      <div className="p-4 border-t">
        <button
          onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Remove Video
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;