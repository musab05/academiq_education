import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, notificationController.getNotifications);
router.patch('/:id/read', authenticate, notificationController.markAsRead);
router.patch('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

export default router;
