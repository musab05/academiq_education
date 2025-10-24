import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getTextLesson, updateTextLesson } from '../controllers/textLessonController.js';

const router = express.Router();

// Get text lesson activity
router.get('/:lessonId', authenticate, getTextLesson);

// Update text lesson activity
router.put('/:lessonId', authenticate, updateTextLesson);

export default router;