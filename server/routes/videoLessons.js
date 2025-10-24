import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getVideoLesson, updateVideoLesson } from '../controllers/videoLessonController.js';

const router = express.Router();

// Get video lesson activity
router.get('/:lessonId', authenticate, getVideoLesson);

// Update video lesson activity
router.put('/:lessonId', authenticate, updateVideoLesson);

export default router;