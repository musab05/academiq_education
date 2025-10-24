import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getSettings, updateSettings, initializeSettings } from '../controllers/settingsController.js';

const router = express.Router();

// Get all system settings
router.get('/', authenticate, getSettings);

// Update system settings
router.put('/', authenticate, updateSettings);

// Initialize default settings
router.post('/init', authenticate, initializeSettings);

export default router;