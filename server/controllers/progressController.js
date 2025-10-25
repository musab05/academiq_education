import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import ScormLessonProgress from '../models/ScormLessonProgress.js';
import Gamification from '../models/Gamification.js';
import { checkAndAwardBadge } from './gamificationController.js';
import { recordActivity } from '../services/activityService.js';
import { syncEnrollmentProgress } from '../utils/progressSync.js';

export const updateScormProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const {
      completionStatus,
      successStatus,
      progressMeasure,
      score,
      timeSpent,
      location,
      suspendData,
      isCompleted,
      isCommit,
      version
    } = req.body;

    console.log('Updating SCORM progress:', { lessonId, userId, version, isCompleted });

    // Find or create SCORM progress record
    let scormProgress = await ScormLessonProgress.findOne({ 
      user: userId, 
      lesson: lessonId 
    });

    if (!scormProgress) {
      // Create new progress record
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      const progress = await Progress.findOneAndUpdate(
        { user: userId, course: lesson.course },
        {
          $set: {
            lastAccessed: new Date()
          }
        },
        { upsert: true, new: true }
      );

      scormProgress = new ScormLessonProgress({
        user: userId,
        lesson: lessonId,
        progress: progress._id,
        learnerId: userId.toString(),
        learnerName: req.user.name || `${req.user.firstName} ${req.user.lastName}`,
        scoId: lessonId,
        courseId: lesson.course.toString(),
        sessionStartTime: new Date()
      });
    }

    // Update SCORM data based on version
    if (version === '1.2') {
      scormProgress.cmiData['cmi.core.lesson_status'] = completionStatus || 'incomplete';
      if (score) scormProgress.cmiData['cmi.core.score.raw'] = parseFloat(score);
      if (timeSpent) scormProgress.cmiData['cmi.core.session_time'] = timeSpent;
      if (location) scormProgress.cmiData['cmi.core.lesson_location'] = location;
      if (suspendData) scormProgress.cmiData['cmi.suspend_data'] = suspendData;
    } else {
      // SCORM 2004
      scormProgress.cmiData['cmi.completion_status'] = completionStatus || 'incomplete';
      scormProgress.cmiData['cmi.success_status'] = successStatus || 'unknown';
      if (progressMeasure) scormProgress.cmiData['cmi.progress_measure'] = parseFloat(progressMeasure);
      if (score) scormProgress.cmiData['cmi.score.raw'] = parseFloat(score);
      if (timeSpent) scormProgress.cmiData['cmi.session_time'] = timeSpent;
      if (location) scormProgress.cmiData['cmi.location'] = location;
      if (suspendData) scormProgress.cmiData['cmi.suspend_data'] = suspendData;
    }

    // Mark completion
    scormProgress.isCompleted = isCompleted || 
      completionStatus === 'completed' || 
      completionStatus === 'passed' ||
      successStatus === 'passed';

    if (scormProgress.isCompleted) {
      scormProgress.completedAt = new Date();
    }

    await scormProgress.save();

    // Update course progress if lesson is completed
    if (scormProgress.isCompleted) {
      const lesson = await Lesson.findById(lessonId);
      if (lesson) {
        await updateCourseProgress(userId, lessonId);
        await syncEnrollmentProgress(userId, lesson.course);
      }
    }

    res.json({ 
      success: true, 
      progress: scormProgress,
      isCompleted: scormProgress.isCompleted
    });
  } catch (error) {
    console.error('Error updating SCORM progress:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const progress = await Progress.findOneAndUpdate(
      { user: userId, lesson: lessonId, course: lesson.course },
      {
        $set: {
          status: 'completed',
          progress: 100,
          completedAt: new Date(),
          lastAccessed: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Update course progress
    await updateCourseProgress(userId, lesson.course);
    await syncEnrollmentProgress(userId, lesson.course);
    
    // Award XP using activity service
    const activityResult = await recordActivity(
      userId,
      'complete_lesson',
      'lesson',
      lessonId,
      { courseId: lesson.course }
    );
    
    // Check for first lesson badge
    const lessonCount = await Progress.countDocuments({ user: userId, status: 'completed' });
    if (lessonCount === 1) {
      await checkAndAwardBadge(userId, 'FIRST_LESSON', lesson.course);
    }

    res.json({ ...progress.toObject(), ...activityResult });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.find({ 
      user: userId, 
      course: courseId 
    }).populate('lesson');

    res.json(progress);
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCourseProgress = async (userId, lessonId) => {
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return;

    // Get all lessons in the course
    const allLessons = await Lesson.find({ course: lesson.course }).select('_id type');
    const totalLessons = allLessons.length;

    if (totalLessons === 0) return;

    // Count completed lessons of different types
    const completedRegularLessons = await Progress.countDocuments({
      user: userId,
      lesson: { $in: allLessons.filter(l => l.type !== 'scorm').map(l => l._id) },
      status: 'completed'
    });

    const completedScormLessons = await ScormLessonProgress.countDocuments({
      user: userId,
      lesson: { $in: allLessons.filter(l => l.type === 'scorm').map(l => l._id) },
      isCompleted: true
    });

    const totalCompleted = completedRegularLessons + completedScormLessons;
    const courseProgress = Math.round((totalCompleted / totalLessons) * 100);

    // Update course progress
    await Progress.findOneAndUpdate(
      { user: userId, course: lesson.course },
      {
        $set: {
          progress: courseProgress,
          status: courseProgress === 100 ? 'completed' : courseProgress > 0 ? 'in_progress' : 'not_started',
          lastAccessed: new Date()
        }
      },
      { upsert: true }
    );

    console.log(`Course progress updated: ${courseProgress}% (${totalCompleted}/${totalLessons} lessons completed)`);
  } catch (error) {
    console.error('Error updating course progress:', error);
  }
};



