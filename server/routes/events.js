import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent, registerForEvent, unregisterFromEvent } from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getEvents);
router.post('/', authenticate, createEvent);
router.put('/:eventId', authenticate, updateEvent);
router.delete('/:eventId', authenticate, deleteEvent);
router.post('/:eventId/register', authenticate, registerForEvent);
router.delete('/:eventId/attendees/:userId', authenticate, unregisterFromEvent);

export default router;