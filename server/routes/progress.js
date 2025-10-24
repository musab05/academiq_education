import express from 'express';
import { markLessonComplete, getCourseProgress, updateScormProgress } from '../controllers/progressController.js';
import { updateTextLessonProgress, getTextLessonProgress } from '../controllers/textLessonController.js';
import { updateVideoLessonProgress, getVideoLessonProgress } from '../controllers/videoLessonController.js';
import { updateBlockLessonProgress, getBlockLessonProgress } from '../controllers/blockLessonController.js';
import { initializeScormSession, getCMIValue, setCMIValue, commitScormData, getScormLessonProgress, addInteraction, setObjective } from '../controllers/scormLessonController.js';
import { getUserLessonProgress, getLessonDetails } from '../controllers/userProgressController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.put('/lesson/:lessonId/text', authenticate, updateTextLessonProgress);
router.put('/lesson/:lessonId/video', authenticate, updateVideoLessonProgress);
router.put('/lesson/:lessonId/block', authenticate, updateBlockLessonProgress);
router.put('/lesson/:lessonId/complete', authenticate, markLessonComplete);
router.get('/course/:courseId', authenticate, getCourseProgress);
router.get('/lesson/:lessonId/text', authenticate, getTextLessonProgress);
router.get('/lesson/:lessonId/video', authenticate, getVideoLessonProgress);
router.get('/lesson/:lessonId/block', authenticate, getBlockLessonProgress);
router.post('/lesson/:lessonId/scorm/initialize', authenticate, initializeScormSession);
router.get('/lesson/:lessonId/scorm/cmi', authenticate, getCMIValue);
router.put('/lesson/:lessonId/scorm/cmi', authenticate, setCMIValue);
router.post('/lesson/:lessonId/scorm/commit', authenticate, commitScormData);
router.get('/lesson/:lessonId/scorm', authenticate, getScormLessonProgress);
router.post('/lesson/:lessonId/scorm/interaction', authenticate, addInteraction);
router.post('/lesson/:lessonId/scorm/objective', authenticate, setObjective);
router.put('/lesson/:lessonId/scorm', authenticate, updateScormProgress);
router.post('/scorm/:lessonId', authenticate, commitScormData);
router.get('/user/:userId/course/:courseSlug', authenticate, getUserLessonProgress);
router.get('/lesson/:lessonId/course/:courseSlug/details', authenticate, getLessonDetails);

export default router;
