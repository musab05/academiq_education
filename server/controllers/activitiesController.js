import Lesson from '../models/Lesson.js';
import TextLesson from '../models/TextLesson.js';
import VideoLesson from '../models/VideoLesson.js';
import QuizLesson from '../models/QuizLesson.js';
import AssignmentLesson from '../models/AssignmentLesson.js';
import DocumentLesson from '../models/DocumentLesson.js';
import BlockLesson from '../models/BlockLesson.js';
import ScormLesson from '../models/ScormLesson.js';

export const getActivity = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    let activity = null;

    switch (lesson.type) {
      case 'text':
        activity = await TextLesson.findOne({ lesson: lessonId });
        break;
      case 'video':
        activity = await VideoLesson.findOne({ lesson: lessonId });
        break;
      case 'quiz':
        activity = await QuizLesson.findOne({ lesson: lessonId }).populate('questions');
        break;
      case 'assignment':
        activity = await AssignmentLesson.findOne({ lesson: lessonId });
        break;
      case 'document':
        activity = await DocumentLesson.findOne({ lesson: lessonId });
        break;
      case 'blocks':
        activity = await BlockLesson.findOne({ lesson: lessonId });
        break;
      case 'scorm':
        activity = await ScormLesson.findOne({ lesson: lessonId });
        break;
    }

    res.json({ lesson, activity });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};