import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  getClassrooms,
  getAllPublicClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  enrollStudent,
  unenrollStudent,
  enrollTeam,
  unenrollTeam,
  getMyClassrooms,
} from '../controllers/classroomManagementController.js';

const router = express.Router();

router.get('/', authenticate, getClassrooms);
router.get('/public', getAllPublicClassrooms);
router.get('/my-classrooms', authenticate, getMyClassrooms);
router.post('/', authenticate, requireRole('superadmin', 'admin', 'instructor'), createClassroom);
router.put('/:classroomId', authenticate, updateClassroom);
router.delete('/:classroomId', authenticate, deleteClassroom);
router.post('/:classroomId/enroll', authenticate, enrollStudent);
router.delete('/:classroomId/unenroll/:studentId', authenticate, unenrollStudent);
router.post('/:classroomId/enroll-team', authenticate, enrollTeam);
router.delete('/:classroomId/unenroll-team/:teamId', authenticate, unenrollTeam);

export default router;
