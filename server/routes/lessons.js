import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getLessonsForCourse,
  createLesson,
  createChapter,
  updateLesson,
  updateChapter,
  deleteLesson,
  deleteChapter,
  uploadAttachment,
  deleteAttachment,
  reorderItems,
  upload
} from '../controllers/lessonController.js';

const router = express.Router();

// Get lesson stats for reports
router.get('/stats/:courseSlug', authenticate, async (req, res) => {
  const { getLessonStats } = await import('../controllers/reportController.js');
  return getLessonStats(req, res);
});

// Get lessons for a course
router.get('/course/:courseId', authenticate, getLessonsForCourse);

// Create lesson
router.post('/create', authenticate, createLesson);

// Create chapter
router.post('/chapter/create', authenticate, createChapter);

// Update lesson
router.put('/:id', authenticate, updateLesson);

// Update chapter
router.put('/chapter/:id', authenticate, updateChapter);

// Delete lesson
router.delete('/:id', authenticate, deleteLesson);

// Delete chapter
router.delete('/chapter/:id', authenticate, deleteChapter);

// Upload attachment
router.post('/:id/attachments', authenticate, upload.single('file'), uploadAttachment);

// Delete attachment
router.delete('/:id/attachments/:attachmentId', authenticate, deleteAttachment);

// Reorder items
router.post('/reorder', authenticate, reorderItems);

export default router;