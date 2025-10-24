import Lesson from '../models/Lesson.js';
import VideoLesson from '../models/VideoLesson.js';
import VideoLessonProgress from '../models/VideoLessonProgress.js';
import Progress from '../models/Progress.js';
import { processLessonContent } from '../services/contentProcessingService.js';

export const getVideoLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const activity = await VideoLesson.findOne({ lesson: lessonId });
    res.json({ lesson, activity });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateVideoLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateData = req.body;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const videoData = {
      lesson: lessonId,
      videoUrl: updateData.videoUrl || '',
      sourceType: updateData.sourceType || 'link',
      duration: 0,
      quality: '720p',
      autoplay: updateData.autoplay || false,
      allowDownload: updateData.allowDownload || false,
      subtitles: updateData.subtitles || [],
      chapters: updateData.chapters || []
    };
    
    const activity = await VideoLesson.findOneAndUpdate(
      { lesson: lessonId },
      videoData,
      { new: true, upsert: true }
    );

    // Reset all user progress for this lesson when content is updated
    await VideoLessonProgress.deleteMany({ lesson: lessonId });
    console.log(`Reset video lesson progress for lesson ${lessonId}`);

    processLessonContent(lessonId, lesson.course._id, 'video', updateData).catch(err => 
      console.error('Background content processing failed:', err)
    );

    res.json(activity);
  } catch (error) {
    console.error('Error updating video lesson:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const updateVideoLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { currentTime, duration, watchedTime, skippedTime } = req.body;
    const userId = req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Find or create Progress record - MUST be saved before creating VideoLessonProgress
    let progress = await Progress.findOne({ user: userId, course: lesson.course, lesson: lessonId });
    if (!progress) {
      progress = new Progress({
        user: userId,
        course: lesson.course,
        lesson: lessonId,
        progress: 0,
        status: 'not_started'
      });
      await progress.save();
    }

    let videoProgress = await VideoLessonProgress.findOne({ user: userId, lesson: lessonId });
    
    const effectiveWatchTime = (watchedTime || 0) - (skippedTime || 0);
    const completionThreshold = (duration || 0) * 0.8;
    const isCompleted = effectiveWatchTime >= completionThreshold;
    
    if (!videoProgress) {
      videoProgress = new VideoLessonProgress({
        user: userId,
        lesson: lessonId,
        progress: progress._id,
        currentTime: currentTime || 0,
        duration: duration || 0,
        watchedTime: watchedTime || 0,
        skippedTime: skippedTime || 0,
        isCompleted,
        ...(isCompleted && { completedAt: new Date() })
      });
      await videoProgress.save();
    } else if (!videoProgress.isCompleted) {
      videoProgress = await VideoLessonProgress.findOneAndUpdate(
        { user: userId, lesson: lessonId },
        {
          $set: {
            currentTime: currentTime || 0,
            duration: duration || 0,
            watchedTime: watchedTime || 0,
            skippedTime: skippedTime || 0,
            isCompleted,
            ...(isCompleted && { completedAt: new Date() })
          }
        },
        { new: true }
      );
    }

    await updateCourseProgress(userId, lesson.course);

    res.json(videoProgress);
  } catch (error) {
    console.error('Error updating video lesson progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getVideoLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const videoProgress = await VideoLessonProgress.findOne({ 
      user: userId, 
      lesson: lessonId 
    });

    res.json(videoProgress || { isCompleted: false, currentTime: 0, watchedTime: 0 });
  } catch (error) {
    console.error('Error fetching video lesson progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCourseProgress = async (userId, courseId) => {
  try {
    const videoLessons = await Lesson.find({ course: courseId, type: 'video' }).select('_id');
    const videoLessonIds = videoLessons.map(l => l._id);
    
    const completedCount = await VideoLessonProgress.countDocuments({ 
      user: userId, 
      lesson: { $in: videoLessonIds },
      isCompleted: true 
    });

    const courseProgress = videoLessons.length > 0 ? Math.round((completedCount / videoLessons.length) * 100) : 0;
    
    await Progress.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        $set: {
          progress: courseProgress,
          status: courseProgress === 100 ? 'completed' : courseProgress > 0 ? 'in_progress' : 'not_started',
          lastAccessed: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log(`Course ${courseId} video progress: ${courseProgress}% (${completedCount}/${videoLessons.length})`);
  } catch (error) {
    console.error('Error updating course progress:', error);
  }
};