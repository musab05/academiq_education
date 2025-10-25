import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import User from '../models/User.js';
import Institute from '../models/Institute.js';
import Notification from '../models/Notification.js';
import InstructorRequest from '../models/InstructorRequest.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Classroom from '../models/Classroom.js';
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

// Helper function to auto-enroll user in institute courses and classrooms
const autoEnrollInInstituteCourses = async (user) => {
  try {
    if (!user.institute) return;

    // Find all courses with auto-enrollment enabled for this institute
    const courses = await Course.find({
      institute: user.institute,
      autoEnrollInstituteCourses: true,
      published: true
    });

    // Enroll user in all auto-enrollment courses
    const coursePromises = courses.map(async (course) => {
      const existingEnrollment = await Enrollment.findOne({
        enrolleeType: 'user',
        enrolleeId: user._id,
        course: course._id
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          enrolleeType: 'user',
          enrolleeId: user._id,
          enrolleeModel: 'User',
          course: course._id,
          enrolledBy: user._id,
          enrollmentSource: 'admin',
          status: 'active'
        });

        if (!course.enrolledUsers.includes(user._id)) {
          course.enrolledUsers.push(user._id);
          await course.save();
        }
      }
    });

    // Find all classrooms with auto-enrollment enabled for this institute
    const classrooms = await Classroom.find({
      institute: user.institute,
      autoEnrollInstituteStudents: true,
      isActive: true
    });

    // Enroll user in all auto-enrollment classrooms
    const classroomPromises = classrooms.map(async (classroom) => {
      if (!classroom.enrolledStudents.includes(user._id)) {
        classroom.enrolledStudents.push(user._id);
        await classroom.save();
      }
    });

    await Promise.all([...coursePromises, ...classroomPromises]);
    console.log(`Auto-enrolled user ${user.email} in ${courses.length} course(s) and ${classrooms.length} classroom(s)`);
  } catch (error) {
    console.error('Error auto-enrolling in institute courses/classrooms:', error);
  }
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

    // Auto-enroll in institute courses if applicable
    if (instituteId) {
      await autoEnrollInInstituteCourses(newUser);
    }

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

// Endpoint to manually trigger auto-enrollment for logged-in users
export const syncInstituteEnrollments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.institute) {
      await autoEnrollInInstituteCourses(user);
      return res.json({ message: 'Enrollments synced successfully' });
    }

    res.json({ message: 'No institute associated with your account' });
  } catch (error) {
    console.error('Error syncing enrollments:', error);
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

    // Auto-enroll in institute courses on login
    if (user.institute) {
      await autoEnrollInInstituteCourses(user);
    }

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
