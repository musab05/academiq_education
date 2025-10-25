import express from 'express';
import AdminRequest from '../models/AdminRequest.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { emitNotification } from '../services/signalingServer.js';

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    return authenticate(req, res, next);
  }
  next();
};

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { requestType, instituteName, instituteType, instituteDomain, instituteAddress, institutePhone, instituteWebsite,
            organizationName, organizationType, organizationAddress, organizationPhone, organizationWebsite, 
            userId, firstName, lastName, email, password } = req.body;

    let targetUserId = userId;
    let user;

    // If userId provided, use existing user (must be authenticated)
    if (userId) {
      if (!req.user || req.user.id !== userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      // Create new user as student
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'User details required' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      user = new User({
        firstName,
        lastName,
        email,
        username,
        password,
        role: 'student'
      });
      await user.save();
      targetUserId = user._id;
    }

    const existingRequest = await AdminRequest.findOne({ user: targetUserId, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending admin request' });
    }

    const adminRequest = new AdminRequest({
      user: targetUserId,
      requestType,
      instituteName,
      instituteType,
      instituteDomain,
      instituteAddress,
      institutePhone,
      instituteWebsite,
      organizationName,
      organizationType,
      organizationAddress,
      organizationPhone,
      organizationWebsite,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username
      }
    });

    await adminRequest.save();

    const superAdmins = await User.find({ role: 'superadmin' });
    superAdmins.forEach(admin => {
      emitNotification(admin._id.toString(), {
        type: 'admin_request',
        message: `New admin request from ${user.firstName} ${user.lastName}`,
        link: '/admin/instructor-requests'
      });
    });

    res.status(201).json({ message: 'Admin request submitted successfully', request: adminRequest });
  } catch (error) {
    console.error('Error creating admin request:', error);
    res.status(500).json({ message: 'Failed to submit admin request' });
  }
});

router.get('/my-request', authenticate, async (req, res) => {
  try {
    const request = await AdminRequest.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(request);
  } catch (error) {
    console.error('Error fetching admin request:', error);
    res.status(500).json({ message: 'Failed to fetch admin request' });
  }
});

router.get('/', authenticate, authorize(['superadmin']), async (req, res) => {
  try {
    const requests = await AdminRequest.find().populate('user', '-password').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({ message: 'Failed to fetch admin requests' });
  }
});

router.post('/:id/approve', authenticate, authorize(['superadmin']), async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id).populate('user');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const Institute = (await import('../models/Institute.js')).default;

    const instituteName = request.requestType === 'institute' ? request.instituteName : request.organizationName;
    const instituteDomain = request.instituteDomain || request.organizationName?.toLowerCase().replace(/\s+/g, '-');

    const institute = new Institute({
      name: instituteName,
      domain: instituteDomain,
      admin: request.user._id,
      createdBy: req.user.id
    });
    await institute.save();

    await User.findByIdAndUpdate(request.user._id, { 
      role: 'admin',
      institute: institute._id
    });

    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewDate = new Date();
    await request.save();

    emitNotification(request.user._id.toString(), {
      type: 'admin_approved',
      message: 'Your admin request has been approved!',
      link: '/profile'
    });

    res.json({ message: 'Admin request approved', request });
  } catch (error) {
    console.error('Error approving admin request:', error);
    res.status(500).json({ message: 'Failed to approve request' });
  }
});

router.post('/:id/reject', authenticate, authorize(['superadmin']), async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id).populate('user');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';
    request.reviewedBy = req.user.id;
    request.reviewDate = new Date();
    request.reviewNotes = req.body.notes || '';
    await request.save();

    emitNotification(request.user._id.toString(), {
      type: 'admin_rejected',
      message: 'Your admin request has been rejected',
      link: '/profile'
    });

    res.json({ message: 'Admin request rejected', request });
  } catch (error) {
    console.error('Error rejecting admin request:', error);
    res.status(500).json({ message: 'Failed to reject request' });
  }
});

export default router;
