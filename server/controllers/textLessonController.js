import Lesson from '../models/Lesson.js';
import TextLesson from '../models/TextLesson.js';
import TextLessonProgress from '../models/TextLessonProgress.js';
import Progress from '../models/Progress.js';
import { processLessonContent } from '../services/contentProcessingService.js';

export const getTextLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const activity = await TextLesson.findOne({ lesson: lessonId });
    res.json({ lesson, activity });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTextLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateData = req.body;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const activity = await TextLesson.findOneAndUpdate(
      { lesson: lessonId },
      updateData,
      { new: true, upsert: true }
    );

    processLessonContent(lessonId, lesson.course._id, 'text', updateData).catch(err => 
      console.error('Background content processing failed:', err)
    );

    res.json(activity);
  } catch (error) {
    console.error('Error updating text lesson:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const updateTextLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { scrollPosition, readingTime, isCompleted } = req.body;
    const userId = req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await Progress.findOneAndUpdate(
      { user: userId, course: lesson.course },
      { $setOnInsert: { progress: 0, status: 'not_started' } },
      { upsert: true }
    );

    const shouldComplete = isCompleted !== undefined ? isCompleted : (readingTime >= 30);

    const textProgress = await TextLessonProgress.findOneAndUpdate(
      { user: userId, lesson: lessonId },
      {
        $set: {
          scrollPosition: scrollPosition || 0,
          readingTime: readingTime || 0,
          isCompleted: shouldComplete,
          ...(shouldComplete && { completedAt: new Date() })
        },
        $setOnInsert: { user: userId, lesson: lessonId }
      },
      { new: true, upsert: true, runValidators: false }
    );

    await updateCourseProgress(userId, lesson.course);

    res.json(textProgress);
  } catch (error) {
    console.error('Error updating text lesson progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTextLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const textProgress = await TextLessonProgress.findOne({ 
      user: userId, 
      lesson: lessonId 
    });

    res.json(textProgress || { isCompleted: false, readingTime: 0 });
  } catch (error) {
    console.error('Error fetching text lesson progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCourseProgress = async (userId, courseId) => {
  try {
    const textLessons = await Lesson.find({ course: courseId, type: 'text' }).select('_id');
    const textLessonIds = textLessons.map(l => l._id);
    
    const completedCount = await TextLessonProgress.countDocuments({ 
      user: userId, 
      lesson: { $in: textLessonIds },
      isCompleted: true 
    });

    const courseProgress = textLessons.length > 0 ? Math.round((completedCount / textLessons.length) * 100) : 0;
    
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
    
    console.log(`Course ${courseId} text progress: ${courseProgress}% (${completedCount}/${textLessons.length})`);
  } catch (error) {
    console.error('Error updating course progress:', error);
  }
};