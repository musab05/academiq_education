import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';
import TextLessonProgress from '../models/TextLessonProgress.js';
import VideoLessonProgress from '../models/VideoLessonProgress.js';
import BlockLessonProgress from '../models/BlockLessonProgress.js';
import ScormLessonProgress from '../models/ScormLessonProgress.js';
import Enrollment from '../models/Enrollment.js';

export const getLessonStats = async (req, res) => {
  try {
    const { courseSlug } = req.params;
    
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lessons = await Lesson.find({ course: course._id }).select('_id title type');
    const enrollments = await Enrollment.find({ course: course._id, enrolleeType: 'user' }).populate('enrolleeId');
    const totalEnrolled = enrollments.length;

    const stats = await Promise.all(lessons.map(async (lesson) => {
      let completedCount = 0;
      let inProgressCount = 0;
      let totalScore = 0;
      let scoreCount = 0;

      for (const enrollment of enrollments) {
        if (!enrollment.enrolleeId) continue;
        
        let progressData = null;

        switch (lesson.type) {
          case 'text':
            progressData = await TextLessonProgress.findOne({ user: enrollment.enrolleeId._id, lesson: lesson._id });
            break;
          case 'video':
            progressData = await VideoLessonProgress.findOne({ user: enrollment.enrolleeId._id, lesson: lesson._id });
            break;
          case 'block':
            progressData = await BlockLessonProgress.findOne({ user: enrollment.enrolleeId._id, lesson: lesson._id });
            break;
          case 'scorm':
            progressData = await ScormLessonProgress.findOne({ user: enrollment.enrolleeId._id, lesson: lesson._id });
            break;
        }

        if (progressData) {
          if (progressData.isCompleted) {
            completedCount++;
          } else {
            inProgressCount++;
          }

          if (progressData.score !== undefined && progressData.score !== null) {
            totalScore += progressData.score;
            scoreCount++;
          }
        }
      }

      return {
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        lessonType: lesson.type,
        completedCount,
        inProgressCount,
        completionPercentage: totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0,
        averageScore: scoreCount > 0 ? totalScore / scoreCount : null
      };
    }));

    res.json({ lessons, stats });
  } catch (error) {
    console.error('Error fetching lesson stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
