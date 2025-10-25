import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import VideoLessonProgress from '../models/VideoLessonProgress.js';
import TextLessonProgress from '../models/TextLessonProgress.js';
import BlockLessonProgress from '../models/BlockLessonProgress.js';
import ScormLessonProgress from '../models/ScormLessonProgress.js';
import QuizLessonProgress from '../models/QuizLessonProgress.js';
import AssignmentLessonProgress from '../models/AssignmentLessonProgress.js';
import DocumentLessonProgress from '../models/DocumentLessonProgress.js';
import { recordActivity } from '../services/activityService.js';
import { trackStat } from '../controllers/gamificationController.js';

export const syncEnrollmentProgress = async (userId, courseId) => {
  try {
    const allLessons = await Lesson.find({ course: courseId }).select('_id type');
    const totalLessons = allLessons.length;
    
    if (totalLessons === 0) return;

    let completedCount = 0;

    for (const lesson of allLessons) {
      let isCompleted = false;
      
      switch (lesson.type) {
        case 'video':
          const videoProgress = await VideoLessonProgress.findOne({ user: userId, lesson: lesson._id });
          isCompleted = videoProgress?.isCompleted || false;
          break;
        case 'text':
          const textProgress = await TextLessonProgress.findOne({ user: userId, lesson: lesson._id });
          isCompleted = textProgress?.isCompleted || false;
          break;
        case 'block':
          const blockProgress = await BlockLessonProgress.findOne({ user: userId, lesson: lesson._id });
          isCompleted = blockProgress?.isCompleted || false;
          break;
        case 'scorm':
          const scormProgress = await ScormLessonProgress.findOne({ user: userId, lesson: lesson._id });
          isCompleted = scormProgress?.isCompleted || false;
          break;
        case 'quiz':
          const quizProgress = await QuizLessonProgress.findOne({ user: userId, lesson: lesson._id });
          isCompleted = quizProgress?.isCompleted || false;
          break;
        case 'assignment':
          const assignmentProgress = await AssignmentLessonProgress.findOne({ user: userId, lesson: lesson._id });
          isCompleted = assignmentProgress?.isCompleted || false;
          break;
        case 'document':
          const documentProgress = await DocumentLessonProgress.findOne({ user: userId, lesson: lesson._id });
          isCompleted = documentProgress?.isCompleted || false;
          break;
      }
      
      if (isCompleted) completedCount++;
    }

    const progressPercentage = Math.round((completedCount / totalLessons) * 100);
    const wasCompleted = progressPercentage === 100;

    const enrollment = await Enrollment.findOne({ enrolleeType: 'user', enrolleeId: userId, course: courseId });
    const previousProgress = enrollment?.progress || 0;

    await Enrollment.findOneAndUpdate(
      { enrolleeType: 'user', enrolleeId: userId, course: courseId },
      {
        $set: {
          progress: progressPercentage,
          lastAccessedAt: new Date(),
          ...(wasCompleted && { status: 'completed', completedAt: new Date() })
        }
      },
      { upsert: false }
    );

    // Award XP and badges for course completion
    if (wasCompleted && previousProgress < 100) {
      console.log(`Course completed! Awarding XP and checking badges for user ${userId}`);
      
      try {
        await recordActivity(userId, 'complete_course', 'course', courseId, { courseId });
        await trackStat(userId, 'coursesCompleted');
      } catch (error) {
        console.error('Error awarding course completion rewards:', error);
      }
    }

    console.log(`Enrollment progress synced: ${progressPercentage}% (${completedCount}/${totalLessons})`);
    return progressPercentage;
  } catch (error) {
    console.error('Error syncing enrollment progress:', error);
  }
};
