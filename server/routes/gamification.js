import express from 'express';
import { getUserGamification, getLeaderboard, awardXP, updateStreak, recordActivityEndpoint, getActivities } from '../controllers/gamificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, getUserGamification);
router.get('/leaderboard', authenticate, getLeaderboard);
router.post('/xp', authenticate, awardXP);
router.post('/streak', authenticate, updateStreak);
router.post('/activity', authenticate, recordActivityEndpoint);
router.get('/activities', authenticate, getActivities);

export default router;
