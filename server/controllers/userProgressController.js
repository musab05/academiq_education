import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import TextLessonProgress from '../models/TextLessonProgress.js';
import VideoLessonProgress from '../models/VideoLessonProgress.js';
import BlockLessonProgress from '../models/BlockLessonProgress.js';
import ScormLessonProgress from '../models/ScormLessonProgress.js';

export const getUserLessonProgress = async (req, res) => {
  try {
    const { userId, courseSlug } = req.params;
    
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lessons = await Lesson.find({ course: course._id }).select('_id title type');
    
    const progressData = await Promise.all(lessons.map(async (lesson) => {
      let progress = null;
      let score = null;
      let isCompleted = false;
      let lastAccessed = null;
      let progressPercentage = 0;

      switch (lesson.type) {
        case 'text':
          progress = await TextLessonProgress.findOne({ user: userId, lesson: lesson._id });
          break;
        case 'video':
          progress = await VideoLessonProgress.findOne({ user: userId, lesson: lesson._id });
          break;
        case 'block':
          progress = await BlockLessonProgress.findOne({ user: userId, lesson: lesson._id });
          break;
        case 'scorm':
          progress = await ScormLessonProgress.findOne({ user: userId, lesson: lesson._id });
          break;
      }

      if (progress) {
        isCompleted = progress.isCompleted || false;
        lastAccessed = progress.lastAccessTime || progress.updatedAt;
        score = progress.score;
        
        if (lesson.type === 'video' && progress.watchedDuration && progress.totalDuration) {
          progressPercentage = Math.round((progress.watchedDuration / progress.totalDuration) * 100);
        } else if (progress.progress !== undefined) {
          progressPercentage = progress.progress;
        } else if (isCompleted) {
          progressPercentage = 100;
        }
      }

      return {
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        lessonType: lesson.type,
        progress: progressPercentage,
        score,
        isCompleted,
        lastAccessed
      };
    }));

    res.json(progressData);
  } catch (error) {
    console.error('Error fetching user lesson progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getLessonDetails = async (req, res) => {
  try {
    const { courseSlug, lessonId } = req.params;
    
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const enrollments = await Enrollment.find({ 
      course: course._id, 
      enrolleeType: 'user' 
    }).populate('enrolleeId');

    const userProgress = await Promise.all(enrollments.map(async (enrollment) => {
      const userId = enrollment.enrolleeId._id;
      let progress = null;
      let score = null;
      let isCompleted = false;
      let lastAccessed = null;
      let progressPercentage = 0;

      switch (lesson.type) {
        case 'text':
          progress = await TextLessonProgress.findOne({ user: userId, lesson: lessonId });
          break;
        case 'video':
          progress = await VideoLessonProgress.findOne({ user: userId, lesson: lessonId });
          break;
        case 'block':
          progress = await BlockLessonProgress.findOne({ user: userId, lesson: lessonId });
          break;
        case 'scorm':
          progress = await ScormLessonProgress.findOne({ user: userId, lesson: lessonId });
          break;
      }

      if (progress) {
        isCompleted = progress.isCompleted || false;
        lastAccessed = progress.lastAccessTime || progress.updatedAt;
        score = progress.score;
        
        if (lesson.type === 'video' && progress.watchedDuration && progress.totalDuration) {
          progressPercentage = Math.round((progress.watchedDuration / progress.totalDuration) * 100);
        } else if (progress.progress !== undefined) {
          progressPercentage = progress.progress;
        } else if (isCompleted) {
          progressPercentage = 100;
        }
      }

      return {
        user: enrollment.enrolleeId,
        progress: progressPercentage,
        score,
        isCompleted,
        lastAccessed
      };
    }));

    res.json({
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        type: lesson.type
      },
      userProgress
    });
  } catch (error) {
    console.error('Error fetching lesson details:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
