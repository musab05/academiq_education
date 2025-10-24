import express from 'express';
import { getInstitutes, createInstitute, updateInstitute, deleteInstitute } from '../controllers/instituteController.js';
import { 
  getInstituteAnalytics, 
  getAllInstitutesAnalytics,
  updateInstituteBranding,
  updateInstituteSettings,
  updateInstituteLimits,
  updateSubscription
} from '../controllers/instituteAnalyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', authenticate, requireRole('superadmin'), getInstitutes);
router.post('/', authenticate, requireRole('superadmin'), createInstitute);
router.put('/:id', authenticate, requireRole('superadmin'), updateInstitute);
router.delete('/:id', authenticate, requireRole('superadmin'), deleteInstitute);

// Analytics
router.get('/analytics/all', authenticate, requireRole('superadmin'), getAllInstitutesAnalytics);
router.get('/:id/analytics', authenticate, requireRole('superadmin', 'admin'), getInstituteAnalytics);

// Settings
router.put('/:id/branding', authenticate, requireRole('superadmin'), updateInstituteBranding);
router.put('/:id/settings', authenticate, requireRole('superadmin'), updateInstituteSettings);
router.put('/:id/limits', authenticate, requireRole('superadmin'), updateInstituteLimits);
router.put('/:id/subscription', authenticate, requireRole('superadmin'), updateSubscription);

export default router;
