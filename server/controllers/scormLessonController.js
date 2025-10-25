import Lesson from '../models/Lesson.js';
import ScormLesson from '../models/ScormLesson.js';
import ScormLessonProgress from '../models/ScormLessonProgress.js';
import Progress from '../models/Progress.js';
import { syncEnrollmentProgress } from '../utils/progressSync.js';

export const getScormLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const activity = await ScormLesson.findOne({ lesson: lessonId });
    res.json({ lesson, activity });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateScormLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateData = req.body;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const activity = await ScormLesson.findOneAndUpdate(
      { lesson: lessonId },
      updateData,
      { new: true, upsert: true }
    );

    // Reset all user progress for this lesson when content is updated
    await ScormLessonProgress.deleteMany({ lesson: lessonId });
    console.log(`Reset SCORM lesson progress for lesson ${lessonId}`);

    res.json(activity);
  } catch (error) {
    console.error('Error updating SCORM lesson:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const initializeScormSession = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Find or create Progress record
    let progress = await Progress.findOne({ user: userId, course: lesson.course });
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: lesson.course,
        progress: 0,
        status: 'not_started'
      });
    }

    // Get user details
    const user = req.user;
    const scormLesson = await ScormLesson.findOne({ lesson: lessonId });
    
    // Find existing SCORM progress or create new
    let scormProgress = await ScormLessonProgress.findOne({ user: userId, lesson: lessonId });
    
    if (!scormProgress) {
      const scormVersion = scormLesson?.version || '1.2';
      
      const initialCmiData = scormVersion === '2004' ? {
        'cmi.entry': 'ab-initio',
        'cmi.completion_status': 'incomplete',
        'cmi.success_status': 'unknown',
        'cmi.score.raw': '0',
        'cmi.score.min': '0',
        'cmi.score.max': '100',
        'cmi.location': '',
        'cmi.suspend_data': '',
        'cmi.session_time': 'PT0H0M0S',
        'cmi.total_time': 'PT0H0M0S',
        'cmi.exit': '',
        'cmi.launch_data': scormLesson?.launchData || '',
        'cmi.learner_id': user._id.toString(),
        'cmi.learner_name': user.name || `${user.firstName} ${user.lastName}`,
        'cmi.credit': 'credit',
        'cmi.mode': 'normal'
      } : {
        'cmi.core.entry': 'ab-initio',
        'cmi.core.lesson_status': 'not attempted',
        'cmi.core.score.raw': '0',
        'cmi.core.score.min': '0',
        'cmi.core.score.max': '100',
        'cmi.core.lesson_location': '',
        'cmi.suspend_data': '',
        'cmi.core.session_time': '00:00:00',
        'cmi.core.total_time': '00:00:00',
        'cmi.core.exit': '',
        'cmi.launch_data': scormLesson?.launchData || '',
        'cmi.core.student_id': user._id.toString(),
        'cmi.core.student_name': user.name || `${user.firstName} ${user.lastName}`,
        'cmi.core.credit': 'credit',
        'cmi.core.lesson_mode': 'normal'
      };
      
      // First time - create new session
      scormProgress = await ScormLessonProgress.create({
        user: userId,
        lesson: lessonId,
        progress: progress._id,
        learnerId: user._id.toString(),
        learnerName: user.name || `${user.firstName} ${user.lastName}`,
        scoId: scormLesson?.scoId || lessonId,
        courseId: lesson.course.toString(),
        sessionStartTime: new Date(),
        scormVersion: scormVersion,
        cmiData: initialCmiData
      });
    } else {
      scormProgress.sessionStartTime = new Date();
      if (!scormProgress.isCompleted) {
        scormProgress.cmiData['cmi.core.entry'] = 'resume';
        scormProgress.markModified('cmiData');
      }
      await scormProgress.save();
    }

    console.log('SCORM session initialized with CMI data:', scormProgress.cmiData);

    res.json({
      sessionId: scormProgress._id,
      cmiData: scormProgress.cmiData,
      isResume: scormProgress.cmiData['cmi.core.entry'] === 'resume' || scormProgress.cmiData['cmi.entry'] === 'resume'
    });
  } catch (error) {
    console.error('Error initializing SCORM session:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCMIValue = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { element } = req.query;
    const userId = req.user.id;

    console.log(`Getting CMI value for element: ${element}, lesson: ${lessonId}, user: ${userId}`);

    const scormProgress = await ScormLessonProgress.findOne({ user: userId, lesson: lessonId });
    if (!scormProgress) {
      console.log('SCORM session not found');
      return res.status(404).json({ error: 'SCORM session not found' });
    }

    console.log('Found SCORM progress:', scormProgress.cmiData);
    const value = scormProgress.getCMIValue(element);
    console.log(`Returning value for ${element}: "${value}"`);
    
    res.json({ element, value });
  } catch (error) {
    console.error('Error getting CMI value:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const setCMIValue = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { element, value } = req.body;
    const userId = req.user.id;

    console.log(`Setting CMI value: ${element} = ${value}, lesson: ${lessonId}, user: ${userId}`);

    const scormProgress = await ScormLessonProgress.findOne({ user: userId, lesson: lessonId });
    if (!scormProgress) {
      console.log('SCORM session not found for setCMIValue');
      return res.status(404).json({ error: 'SCORM session not found' });
    }

    await scormProgress.setCMIValue(element, value);
    console.log(`Successfully set CMI value: ${element} = ${value}`);
    
    // Update course progress if lesson completed
    if (['completed', 'passed'].includes(value) && 
        (element === 'cmi.core.lesson_status' || element === 'cmi.core.completion_status')) {
      console.log('Lesson completed, updating course progress');
      const lesson = await Lesson.findById(scormProgress.lesson);
      if (lesson) {
        await updateCourseProgress(userId, scormProgress.lesson);
        await syncEnrollmentProgress(userId, lesson.course);
      }
    }

    res.json({ success: true, element, value });
  } catch (error) {
    console.error('Error setting CMI value:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addInteraction = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const interactionData = req.body;
    const userId = req.user.id;

    const scormProgress = await ScormLessonProgress.findOne({ user: userId, lesson: lessonId });
    if (!scormProgress) {
      return res.status(404).json({ error: 'SCORM session not found' });
    }

    await scormProgress.addInteraction(interactionData);
    res.json({ success: true, interactionId: interactionData.id });
  } catch (error) {
    console.error('Error adding interaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const setObjective = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const objectiveData = req.body;
    const userId = req.user.id;

    const scormProgress = await ScormLessonProgress.findOne({ user: userId, lesson: lessonId });
    if (!scormProgress) {
      return res.status(404).json({ error: 'SCORM session not found' });
    }

    await scormProgress.setObjective(objectiveData);
    res.json({ success: true, objectiveId: objectiveData.id });
  } catch (error) {
    console.error('Error setting objective:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const commitScormData = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const scormProgress = await ScormLessonProgress.findOne({ user: userId, lesson: lessonId });
    if (!scormProgress) {
      return res.status(404).json({ error: 'SCORM session not found' });
    }

    const sessionDuration = Date.now() - scormProgress.sessionStartTime.getTime();
    const sessionTimeFormatted = scormProgress.formatDuration(sessionDuration);
    
    scormProgress.cmiData['cmi.core.session_time'] = sessionTimeFormatted;
    scormProgress.cmiData['cmi.session_time'] = sessionTimeFormatted;
    
    const currentTotal = scormProgress.parseDuration(scormProgress.cmiData['cmi.core.total_time'] || scormProgress.cmiData['cmi.total_time'] || 'PT0H0M0S');
    const newTotal = currentTotal + sessionDuration;
    const newTotalFormatted = scormProgress.formatDuration(newTotal);
    scormProgress.cmiData['cmi.core.total_time'] = newTotalFormatted;
    scormProgress.cmiData['cmi.total_time'] = newTotalFormatted;
    scormProgress.markModified('cmiData');
    
    await scormProgress.save();
    
    if (scormProgress.isCompleted) {
      const lesson = await Lesson.findById(lessonId);
      if (lesson) {
        await updateCourseProgress(userId, lessonId);
        await syncEnrollmentProgress(userId, lesson.course);
      }
    }

    res.json({ success: true, committed: true });
  } catch (error) {
    console.error('Error committing SCORM data:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getScormLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const scormProgress = await ScormLessonProgress.findOne({ 
      user: userId, 
      lesson: lessonId 
    });

    res.json(scormProgress || { isCompleted: false, cmiData: {} });
  } catch (error) {
    console.error('Error fetching SCORM lesson progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getScormActivity = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const activity = await ScormLesson.findOne({ lesson: lessonId });
    res.json({ lesson, activity });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};



const updateCourseProgress = async (userId, lessonId) => {
  try {
    const lesson = await Lesson.findById(lessonId);
    const scormLessons = await Lesson.find({ course: lesson.course, type: 'scorm' }).select('_id');
    const scormLessonIds = scormLessons.map(l => l._id);
    
    const completedCount = await ScormLessonProgress.countDocuments({ 
      user: userId, 
      lesson: { $in: scormLessonIds },
      isCompleted: true 
    });

    const courseProgress = scormLessons.length > 0 ? Math.round((completedCount / scormLessons.length) * 100) : 0;
    
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
  } catch (error) {
    console.error('Error updating course progress:', error);
  }
};
