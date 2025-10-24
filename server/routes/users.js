import express from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getCurrentUserProfile,
  getProfileStats,
  updateProfile,
  changePassword,
  updateProfilePicture,
  resetProfilePicture
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// Profile routes (must come before /:id routes)
router.get('/profile/me', authenticate, getCurrentUserProfile);
router.get('/profile/stats', authenticate, getProfileStats);
router.put('/profile/me', authenticate, updateProfile);
router.put('/profile/password', authenticate, changePassword);
router.put('/profile/picture', authenticate, updateProfilePicture);
router.post('/profile/picture/reset', authenticate, resetProfilePicture);

// Get users (all authenticated users)
router.get('/', authenticate, getUsers);

// Get user by ID (all authenticated users)
router.get('/:id', authenticate, getUserById);

// Create user (superadmin, admin, instructor)
router.post('/', authenticate, requireRole('superadmin', 'admin', 'instructor'), createUser);

// Update user (handled in controller based on role hierarchy)
router.put('/:id', authenticate, requireRole('superadmin', 'admin', 'instructor'), updateUser);

// Delete user (handled in controller based on role hierarchy)
router.delete('/:id', authenticate, requireRole('superadmin', 'admin', 'instructor'), deleteUser);

export default router;
