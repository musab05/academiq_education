import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, Maximize, Settings, SkipForward, SkipBack } from 'lucide-react';
import { lessonAPI, progressAPI } from '../../../services/api';
import { setLessonProgress } from '../../../store/slices/progressSlice';
import LessonNavigation from '../LessonNavigation';

const VideoLessonViewer = ({ lesson, onNextLesson, onPreviousLesson, hasNext, hasPrevious }) => {
  const dispatch = useDispatch();
  const [lessonData, setLessonData] = useState(null);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const youtubePlayerRef = useRef(null);

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
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300);
  const [watchedTime, setWatchedTime] = useState(0);
  const [skippedTime, setSkippedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef(null);
  const lastTimeRef = useRef(0);
  const playStartTimeRef = useRef(0);

  useEffect(() => {
    if (lesson?._id) {
      fetchLessonData();
    }
  }, [lesson?._id]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (lessonData?.sourceType === 'link' && lessonData?.videoUrl?.includes('youtube')) {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
          initYouTubePlayer();
        };
      } else {
        initYouTubePlayer();
      }
    }
  }, [lessonData]);

  const initYouTubePlayer = () => {
    if (!youtubePlayerRef.current) return;
    
    const videoId = getYouTubeVideoId(lessonData.videoUrl);
    if (!videoId) return;

    const player = new window.YT.Player(youtubePlayerRef.current, {
      videoId: videoId,
      playerVars: {
        origin: window.location.origin
      },
      events: {
        onReady: (event) => {
          setYoutubePlayer(event.target);
          setDuration(event.target.getDuration());
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            playStartTimeRef.current = Date.now();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            if (playStartTimeRef.current) {
              const playDuration = (Date.now() - playStartTimeRef.current) / 1000;
              setWatchedTime(prev => prev + Math.min(playDuration, 1));
            }
          } else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            setCurrentTime(duration);
            updateProgress();
          }
        }
      }
    });
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1]?.split('?')[0];
    }
    return null;
  };

  // Track YouTube player time
  useEffect(() => {
    if (!youtubePlayer || !isPlaying) return;
    
    const interval = setInterval(() => {
      const currentTime = youtubePlayer.getCurrentTime();
      setCurrentTime(currentTime);
      
      const timeDiff = currentTime - lastTimeRef.current;
      if (Math.abs(timeDiff) > 2) {
        setSkippedTime(prev => prev + Math.abs(timeDiff));
      } else if (timeDiff > 0) {
        setWatchedTime(prev => prev + timeDiff);
      }
      lastTimeRef.current = currentTime;
    }, 1000);

    return () => clearInterval(interval);
  }, [youtubePlayer, isPlaying]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const response = await lessonAPI.getVideoActivity(lesson._id);
      setLessonData(response.data.activity);
      if (response.data.activity?.duration) {
        setDuration(response.data.activity.duration);
      } else if (videoRef.current?.duration) {
        setDuration(videoRef.current.duration);
      }
      
      // Check existing progress
      const progressResponse = await progressAPI.getVideoLessonProgress(lesson._id);
      console.log('Video lesson progress response:', progressResponse.data);
      if (progressResponse.data && progressResponse.data.isCompleted) {
        console.log('Setting video lesson as completed');
        setIsCompleted(true);
        setCurrentTime(progressResponse.data.currentTime || 0);
        setWatchedTime(progressResponse.data.watchedTime || 0);
        setSkippedTime(progressResponse.data.skippedTime || 0);
      }
    } catch (error) {
      console.error('Error fetching video lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async () => {
    if (!isCompleted) {
      try {
        // Calculate effective watch time (total watched - skipped)
        const effectiveWatchTime = Math.max(0, watchedTime - skippedTime);
        const progressPercentage = duration > 0 ? Math.min(100, (effectiveWatchTime / duration) * 100) : 0;
        
        const response = await progressAPI.updateVideoProgress(lesson._id, {
          currentTime,
          duration,
          watchedTime: effectiveWatchTime, // Send effective time
          skippedTime: 0 // Reset since we're sending net time
        });
        
        console.log('Video progress update response:', response.data);
        
        // Update Redux store for real-time sidebar update
        const courseId = lesson.course?._id || lesson.course;
        if (courseId) {
          dispatch(setLessonProgress({
            courseId,
            lessonId: lesson._id,
            progress: {
              status: response.data.isCompleted ? 'completed' : 'in_progress',
              progress: progressPercentage
            }
          }));
        }
        
        if (response.data && response.data.isCompleted && !isCompleted) {
          console.log('Marking video lesson as completed');
          setIsCompleted(true);
          window.dispatchEvent(new Event('lessonCompleted'));
        }
      } catch (error) {
        console.error('Error updating video progress:', error);
      }
    }
  };

  const handleTimeUpdate = (e) => {
    const video = e.target;
    const newTime = video.currentTime;
    const timeDiff = newTime - lastTimeRef.current;
    
    if (Math.abs(timeDiff) > 2) {
      // User skipped - add the skipped amount
      setSkippedTime(prev => prev + Math.abs(timeDiff));
    } else if (isPlaying && timeDiff > 0) {
      // Normal forward playback - add actual time watched
      setWatchedTime(prev => prev + timeDiff);
    }
    
    setCurrentTime(newTime);
    lastTimeRef.current = newTime;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && !isCompleted) {
        updateProgress();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentTime, duration, watchedTime, skippedTime, isPlaying, isCompleted]);

  // Force update when video ends or reaches near end
  useEffect(() => {
    if (currentTime > 0 && duration > 0 && currentTime >= duration - 1) {
      updateProgress();
    }
  }, [currentTime, duration]);

  // Track play/pause for accurate timing
  useEffect(() => {
    if (isPlaying) {
      playStartTimeRef.current = Date.now();
    }
  }, [isPlaying]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  const handleSkip = (seconds) => {
    if (videoRef.current) {
      const oldTime = videoRef.current.currentTime;
      videoRef.current.currentTime += seconds;
      // Track manual skips
      setSkippedTime(prev => prev + Math.abs(seconds));
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      {/* Video Player */}
      <div className="bg-black relative">
        <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
          {lessonData?.videoUrl ? (
            lessonData.sourceType === 'link' ? (
              lessonData.videoUrl.includes('youtube') ? (
                <div ref={youtubePlayerRef} className="w-full h-full" />
              ) : (
                <iframe
                  className="w-full h-full"
                  src={getEmbedUrl(lessonData.videoUrl)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )
            ) : (
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => {
                setIsPlaying(true);
                playStartTimeRef.current = Date.now();
              }}
              onPause={() => {
                setIsPlaying(false);
                // Add any remaining play time when paused
                if (playStartTimeRef.current) {
                  const playDuration = (Date.now() - playStartTimeRef.current) / 1000;
                  setWatchedTime(prev => prev + Math.min(playDuration, 1)); // Cap at 1 second per update
                }
              }}
              onLoadedMetadata={(e) => {
                setDuration(e.target.duration);
                e.target.playbackRate = playbackRate;
                e.target.volume = volume;
              }}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(duration);
                setWatchedTime(prev => prev + 1); // Add final second
                updateProgress();
              }}
            >
              <source src={lessonData.videoUrl} type="video/mp4" />
              {lessonData?.subtitles && lessonData.subtitles.map((subtitle, index) => (
                <track
                  key={index}
                  kind="subtitles"
                  src={subtitle.url}
                  srcLang={subtitle.language}
                  label={subtitle.language}
                  default={index === 0}
                />
              ))}
              Your browser does not support the video tag.
            </video>
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                <p className="text-gray-300">Video content will be loaded here</p>
              </div>
            </div>
          )}

          {/* Custom Video Controls - Only for uploaded videos */}
          {lessonData.sourceType !== 'link' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (isPlaying) {
                    videoRef.current?.pause();
                  } else {
                    videoRef.current?.play();
                  }
                }}
                className="text-white hover:text-orange-400 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button 
                onClick={() => handleSkip(-10)}
                className="text-white hover:text-orange-400 transition-colors"
                title="Skip back 10s"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button 
                onClick={() => handleSkip(10)}
                className="text-white hover:text-orange-400 transition-colors"
                title="Skip forward 10s"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              
              <div className="flex-1 flex items-center gap-2">
                <span className="text-white text-sm">{formatTime(currentTime)}</span>
                <div className="flex-1 bg-gray-600 rounded-full h-1 cursor-pointer"
                     onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const percent = (e.clientX - rect.left) / rect.width;
                       const newTime = percent * duration;
                       if (videoRef.current) {
                         videoRef.current.currentTime = newTime;
                       }
                     }}>
                  <div 
                    className="bg-orange-500 h-1 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm">{formatTime(duration)}</span>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-orange-400 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded-lg p-3 min-w-48">
                    <div className="mb-3">
                      <label className="text-white text-sm block mb-2">Speed</label>
                      <div className="space-y-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`block w-full text-left px-2 py-1 text-sm rounded ${
                              playbackRate === speed 
                                ? 'bg-orange-500 text-white' 
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-white text-sm block mb-2">Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <button className="text-white hover:text-orange-400 transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              {isCompleted && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Completed
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(duration)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Lesson
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Completed
                </span>
              )}
              {watchedTime > 0 && (
                <span className="text-green-600">
                  Watched: {formatTime(Math.max(0, watchedTime - skippedTime))}
                </span>
              )}
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">What you'll learn</h3>
              <ul className="text-blue-700 space-y-1">
                <li>Core concepts demonstrated in the video</li>
                <li>Practical examples and use cases</li>
                <li>Step-by-step implementation guide</li>
              </ul>
            </div>

            {lesson?.description && (
              <>
                <h2>Video Description</h2>
                <p>{lesson.description}</p>
              </>
            )}

            {lessonData?.chapters && lessonData.chapters.length > 0 && (
              <>
                <h2>Video Chapters</h2>
                <div className="space-y-2">
                  {lessonData.chapters.map((chapter, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <button 
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = chapter.startTime;
                          }
                        }}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        {formatTime(chapter.startTime)}
                      </button>
                      <span className="text-gray-700">{chapter.title}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {lessonData?.subtitles && lessonData.subtitles.length > 0 && (
              <>
                <h2>Available Subtitles</h2>
                <ul>
                  {lessonData.subtitles.map((subtitle, index) => (
                    <li key={index} className="text-gray-700">
                      {subtitle.language}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <LessonNavigation 
            onNextLesson={onNextLesson}
            onPreviousLesson={onPreviousLesson}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default VideoLessonViewer;