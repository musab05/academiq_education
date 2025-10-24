import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getBlockLesson, updateBlockLesson } from '../controllers/blockLessonController.js';

const router = express.Router();

// Get block lesson activity
router.get('/:lessonId', authenticate, getBlockLesson);

// Update block lesson activity
router.put('/:lessonId', authenticate, updateBlockLesson);

export default router;