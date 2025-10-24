import express from 'express';
import { getTeams, createTeam, updateTeam, addMember, removeMember, updateMemberRole, deleteTeam, updateTrackedCourses } from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getTeams);
router.post('/', authenticate, createTeam);
router.put('/:teamId', authenticate, updateTeam);
router.post('/:teamId/members', authenticate, addMember);
router.delete('/:teamId/members/:userId', authenticate, removeMember);
router.put('/:teamId/members/:userId/role', authenticate, updateMemberRole);
router.put('/:teamId/tracked-courses', authenticate, updateTrackedCourses);
router.delete('/:teamId', authenticate, deleteTeam);

export default router;