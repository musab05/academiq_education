import express from 'express';
import { getDepartments, createDepartment, updateDepartment, addMember, removeMember, updateMemberRole, deleteDepartment } from '../controllers/departmentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, checkOwnership, canCreate } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', authenticate, getDepartments);

// Create department (superadmin, admin only)
router.post('/', authenticate, canCreate('department'), createDepartment);

// Update department (owner, admin, superadmin)
router.put('/:departmentId', authenticate, checkOwnership('Department'), updateDepartment);

// Manage members (owner, admin, superadmin)
router.post('/:departmentId/members', authenticate, checkOwnership('Department'), addMember);
router.delete('/:departmentId/members/:userId', authenticate, checkOwnership('Department'), removeMember);
router.put('/:departmentId/members/:userId/role', authenticate, checkOwnership('Department'), updateMemberRole);

// Delete department (owner, admin, superadmin)
router.delete('/:departmentId', authenticate, checkOwnership('Department'), deleteDepartment);

export default router;