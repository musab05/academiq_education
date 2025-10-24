import express from 'express';
import { getTeamMessages, createTeamMessage } from '../controllers/teamMessageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:teamId', authenticate, getTeamMessages);
router.post('/:teamId', authenticate, createTeamMessage);

export default router;
