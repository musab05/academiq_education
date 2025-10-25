import express from 'express';
import InstructorRequest from '../models/InstructorRequest.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { emitNotification, emitRoleUpdate } from '../services/signalingServer.js';

const router = express.Router();

// Get all instructor requests (admin only)
router.get('/', authenticate, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const requests = await InstructorRequest.find()
      .populate('user', '-password')
      .populate('reviewedBy', '-password')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve instructor request
router.post('/:id/approve', authenticate, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const request = await InstructorRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const user = await User.findById(request.user);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = 'instructor';
    await user.save();

    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewDate = new Date();
    request.reviewNotes = req.body?.notes || '';
    await request.save();

    // Send notification to the user
    const notification = await Notification.create({
      recipient: user._id,
      type: 'instructor-approved',
      title: 'Instructor Request Approved',
      message: 'Congratulations! Your instructor role request has been approved. You now have instructor privileges.',
      link: '/profile'
    });

    // Emit real-time notification and role update
    emitNotification(user._id.toString(), notification);
    emitRoleUpdate(user._id.toString(), 'instructor');

    res.json({ message: 'Instructor request approved', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject instructor request
router.post('/:id/reject', authenticate, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const request = await InstructorRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'rejected';
    request.reviewedBy = req.user._id;
    request.reviewDate = new Date();
    request.reviewNotes = req.body?.notes || '';
    await request.save();

    res.json({ message: 'Instructor request rejected', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
