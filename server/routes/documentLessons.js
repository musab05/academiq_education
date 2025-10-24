import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getDocumentLesson, updateDocumentLesson, markDocumentViewed, getDocumentProgress } from '../controllers/documentLessonController.js';

const router = express.Router();

// Get document lesson activity
router.get('/:lessonId', authenticate, getDocumentLesson);

// Update document lesson activity
router.put('/:lessonId', authenticate, updateDocumentLesson);

// Mark document as viewed
router.post('/:lessonId/viewed', authenticate, markDocumentViewed);

// Get document progress
router.get('/:lessonId/progress', authenticate, getDocumentProgress);

export default router;