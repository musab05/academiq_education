import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import User from '../models/User.js';
import Institute from '../models/Institute.js';
import Notification from '../models/Notification.js';
import InstructorRequest from '../models/InstructorRequest.js';
import { extractDomain } from '../middleware/institute.js';

// Utility to generate a unique username
const generateUniqueUsername = async base => {
  let username = base.toLowerCase();
  let exists = await User.findOne({ username });

  while (exists) {
    username = `${base.toLowerCase()}-${nanoid(5)}`;
    exists = await User.findOne({ username });
  }

  return username;
};

// Helper function to create instructor request notification
const createInstructorRequest = async (user) => {
  try {
    // Create instructor request record
    const instructorRequest = new InstructorRequest({
      user: user._id,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username
      }
    });
    
    await instructorRequest.save();
    
    // Find all superadmins to notify
    const superadmins = await User.find({ role: 'superadmin' });
    
    // Create notifications for all superadmins
    const notifications = superadmins.map(admin => ({
      recipient: admin._id,
      type: 'instructor-request',
      title: 'New Instructor Role Request',
      message: `${user.firstName} ${user.lastName} (${user.email}) has requested instructor privileges. Review and approve in the dashboard.`,
      link: `/admin/instructor-requests`, // You'll need to create this page
      metadata: {
        userId: user._id
      }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`Instructor request notifications created for ${notifications.length} superadmin(s)`);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating instructor request:', error);
    return false;
  }
};

export const signup = async (req, res) => {
  const { firstName, lastName, email, password, role, instructorRequest } = req.body;

  try {
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ error: 'Email already exists' });

    const usernameBase = email.split('@')[0];
    const username = await generateUniqueUsername(usernameBase);

    // Auto-assign institute based on email domain
    const domain = extractDomain(email);
    let instituteId = null;
    if (domain) {
      const institute = await Institute.findOne({ domain, isActive: true });
      if (institute && institute.settings.autoEnrollByDomain) {
        instituteId = institute._id;
      }
    }

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      role, // This will be 'student' even for instructor requests
      institute: instituteId,
    });

    await newUser.save();

    // If instructor role was requested, create a notification for superadmin
    if (instructorRequest) {
      await createInstructorRequest(newUser);
    }

    const token = jwt.sign(
      { id: newUser._id, uuid: newUser.uuid, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        uuid: newUser.uuid,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const signin = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, uuid: user.uuid, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        uuid: user.uuid,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
