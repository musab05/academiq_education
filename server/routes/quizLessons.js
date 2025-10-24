import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getQuizLesson, updateQuizLesson, submitQuizAttempt, getQuizProgress } from '../controllers/quizLessonController.js';
import Lesson from '../models/Lesson.js';
import QuizLesson from '../models/QuizLesson.js';
import Question from '../models/Question.js';

const router = express.Router();

// Get quiz lesson activity
router.get('/:lessonId', authenticate, getQuizLesson);

// Update quiz lesson activity
router.put('/:lessonId', authenticate, updateQuizLesson);

// Submit quiz attempt
router.post('/:lessonId/submit', authenticate, submitQuizAttempt);

// Get quiz progress
router.get('/:lessonId/progress', authenticate, getQuizProgress);

// Get paginated questions for a quiz lesson
router.get('/:lessonId/questions', authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const quiz = await QuizLesson.findOne({ lesson: lessonId });
    if (!quiz) {
      return res.json({ questions: [], total: 0 });
    }

    const searchQuery = search ? { question: { $regex: search, $options: 'i' } } : {};
    const skip = (page - 1) * limit;

    const questions = await Question.find({
      _id: { $in: quiz.questions },
      ...searchQuery
    })
    .sort({ order: 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Question.countDocuments({
      _id: { $in: quiz.questions },
      ...searchQuery
    });

    res.json({ questions, total });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;