import ClassroomSession from '../models/ClassroomSession.js';
import Classroom from '../models/Classroom.js';
import Course from '../models/Course.js';

// Helper function to find session by ID excluding deleted ones
const findActiveSessionById = (sessionId) => {
  return ClassroomSession.findOne({ 
    _id: sessionId, 
    isDeleted: { $ne: true } 
  });
};

export const getSessionAnalytics = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await findActiveSessionById(sessionId)
      .populate('classroom', 'title')
      .populate('course', 'title')
      .populate('instructor', 'firstName lastName email')
      .populate('attendance.user', 'firstName lastName email')
      .populate('allowedParticipants', 'firstName lastName email')
      .populate('institute', 'name')
      .populate('department', 'name')
      .exec();
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Group attendance by user to calculate total duration per user
    const userAttendance = {};
    session.attendance.forEach(a => {
      const userId = a.user._id.toString();
      if (!userAttendance[userId]) {
        userAttendance[userId] = {
          user: a.user,
          totalDuration: 0,
          sessions: [],
        };
      }
      userAttendance[userId].totalDuration += a.duration || 0;
      userAttendance[userId].sessions.push({
        joinTime: a.joinTime,
        leaveTime: a.leaveTime,
        duration: a.duration,
      });
    });

    const uniqueAttendees = Object.keys(userAttendance).length;
    const activeParticipants = session.attendance.filter(a => !a.leaveTime).length;
    const totalDuration = Object.values(userAttendance).reduce((sum, u) => sum + u.totalDuration, 0);
    const avgDuration = uniqueAttendees > 0 ? totalDuration / uniqueAttendees : 0;

    res.json({
      session,
      analytics: {
        uniqueAttendees,
        totalAttendees: session.attendance.length,
        activeParticipants,
        maxParticipants: session.maxParticipants,
        avgDuration: Math.round(avgDuration),
        attendanceRate: uniqueAttendees > 0 ? 100 : 0,
        userAttendance: Object.values(userAttendance),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const currentUser = req.user;
    
    const session = await findActiveSessionById(sessionId)
      .populate('classroom', 'title')
      .populate('course', 'title')
      .populate('instructor', 'firstName lastName email')
      .populate('attendance.user', 'firstName lastName email')
      .populate('allowedParticipants', 'firstName lastName email')
      .populate('institute', 'name')
      .populate('department', 'name')
      .exec();
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if session has ended
    const now = new Date();
    const sessionEndTime = new Date(session.endTime);
    
    if (sessionEndTime < now) {
      // Only allow access for instructors and admins to ended sessions
      const canAccessEnded = currentUser.role === 'superadmin' ||
                            session.instructor._id.toString() === currentUser._id.toString() ||
                            (currentUser.role === 'admin' && session.institute?.toString() === currentUser.institute?.toString());
      
      if (!canAccessEnded) {
        return res.status(403).json({ 
          error: 'This session has ended and is no longer accessible to students.',
          sessionEnded: true 
        });
      }
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSessions = async (req, res) => {
  try {
    const currentUser = req.user;
    const { courseId, classroomId, status } = req.query;
    
    let query = {};
    
    if (courseId) {
      query.course = courseId;
    }
    
    if (classroomId) {
      query.classroom = classroomId;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Institute filtering for admins
    if (currentUser.role === 'admin' && currentUser.institute) {
      query.institute = currentUser.institute;
    }
    
    // Exclude soft-deleted sessions
    query.isDeleted = { $ne: true };
    
    const sessions = await ClassroomSession.find(query)
      .populate('classroom', 'title')
      .populate('course', 'title')
      .populate('instructor', 'firstName lastName email')
      .populate('attendance.user', 'firstName lastName email')
      .populate('allowedParticipants', 'firstName lastName email')
      .populate('institute', 'name')
      .populate('department', 'name')
      .sort({ startTime: -1 });
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createSession = async (req, res) => {
  try {
    const { classroomId, courseId, title, description, startTime, endTime, meetingLink, maxParticipants, isPrivate, accessCode, allowedParticipants } = req.body;
    const currentUser = req.user;
    
    const session = new ClassroomSession({
      classroom: classroomId || null,
      course: courseId || null,
      title,
      description,
      instructor: currentUser._id,
      meetingLink,
      startTime,
      endTime,
      maxParticipants: maxParticipants || 100,
      isPrivate: isPrivate || false,
      accessCode: accessCode || '',
      allowedParticipants: allowedParticipants || [],
      institute: currentUser.institute || null,
      department: currentUser.department || null,
      createdBy: currentUser._id,
    });
    
    await session.save();
    await session.populate('classroom', 'title');
    await session.populate('course', 'title');
    await session.populate('instructor', 'firstName lastName email');
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, description, startTime, endTime, meetingLink, recordingLink, status, maxParticipants, isPrivate, accessCode, allowedParticipants } = req.body;
    const currentUser = req.user;
    
    const session = await findActiveSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Permission check
    const canEdit = currentUser.role === 'superadmin' ||
                    session.instructor.toString() === currentUser._id.toString() ||
                    (currentUser.role === 'admin' && session.institute?.toString() === currentUser.institute?.toString());
    
    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (title) session.title = title;
    if (description !== undefined) session.description = description;
    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    if (meetingLink !== undefined) session.meetingLink = meetingLink;
    if (recordingLink !== undefined) session.recordingLink = recordingLink;
    if (status) session.status = status;
    if (maxParticipants) session.maxParticipants = maxParticipants;
    if (isPrivate !== undefined) session.isPrivate = isPrivate;
    if (accessCode !== undefined) session.accessCode = accessCode;
    if (allowedParticipants) session.allowedParticipants = allowedParticipants;
    
    await session.save();
    await session.populate('classroom', 'title');
    await session.populate('course', 'title');
    await session.populate('instructor', 'firstName lastName email');
    
    res.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const currentUser = req.user;
    
    const session = await findActiveSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if already deleted
    if (session.isDeleted) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const canDelete = currentUser.role === 'superadmin' ||
                      session.instructor.toString() === currentUser._id.toString() ||
                      (currentUser.role === 'admin' && session.institute?.toString() === currentUser.institute?.toString());
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Soft delete - preserve attendance records
    await ClassroomSession.findByIdAndUpdate(sessionId, {
      isDeleted: true,
      deletedAt: new Date(),
      status: 'cancelled' // Update status to cancelled
    });
    
    res.json({ message: 'Session deleted successfully. Attendance records have been preserved for reporting purposes.' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { accessCode } = req.body;
    const currentUser = req.user;
    
    const session = await findActiveSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if session has ended
    const now = new Date();
    const sessionEndTime = new Date(session.endTime);
    
    if (sessionEndTime < now) {
      return res.status(403).json({ 
        error: 'This session has ended and can no longer be joined.',
        sessionEnded: true 
      });
    }
    
    // Access control checks
    if (session.isPrivate) {
      const isInstructor = session.instructor.toString() === currentUser._id.toString();
      const isAllowed = session.allowedParticipants.some(p => p.toString() === currentUser._id.toString());
      const hasValidCode = session.accessCode && accessCode === session.accessCode;
      
      if (!isInstructor && !isAllowed && !hasValidCode) {
        return res.status(403).json({ error: 'Access denied. This is a private session.' });
      }
    }
    
    // Check capacity
    const activeParticipants = session.attendance.filter(a => !a.leaveTime).length;
    if (activeParticipants >= session.maxParticipants) {
      const isInstructor = session.instructor.toString() === currentUser._id.toString();
      if (!isInstructor) {
        return res.status(403).json({ error: 'Session is at full capacity' });
      }
    }
    
    // Check if user has any attendance record (active or completed)
    const existingAttendance = session.attendance.find(
      a => a.user.toString() === currentUser._id.toString() && !a.leaveTime
    );
    
    if (existingAttendance) {
      return res.json({ message: 'Already joined', session });
    }
    
    // Check if user previously left and is rejoining
    const previousAttendance = session.attendance.find(
      a => a.user.toString() === currentUser._id.toString() && a.leaveTime
    );
    
    if (previousAttendance) {
      // User is rejoining - create new attendance entry
      session.attendance.push({
        user: currentUser._id,
        joinTime: new Date(),
      });
    } else {
      // First time joining
      session.attendance.push({
        user: currentUser._id,
        joinTime: new Date(),
      });
    }
    
    if (session.status === 'upcoming') {
      session.status = 'live';
    }
    
    await session.save();
    res.json({ message: 'Joined successfully', session });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const leaveSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const currentUser = req.user;
    
    const session = await ClassroomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const attendance = session.attendance.find(
      a => a.user.toString() === currentUser._id.toString() && !a.leaveTime
    );
    
    if (attendance) {
      attendance.leaveTime = new Date();
      attendance.duration = Math.round((attendance.leaveTime - attendance.joinTime) / 60000);
      await session.save();
    }
    
    res.json({ message: 'Left successfully', session });
  } catch (error) {
    console.error('Error leaving session:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadResource = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name, url } = req.body;
    const currentUser = req.user;
    
    const session = await ClassroomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.instructor.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Only instructor can upload resources' });
    }
    
    session.resources.push({ name, url });
    await session.save();
    
    res.json(session);
  } catch (error) {
    console.error('Error uploading resource:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeParticipant = async (req, res) => {
  try {
    const { sessionId, userId } = req.params;
    const currentUser = req.user;
    
    const session = await findActiveSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Only instructor or admin can remove participants
    const canRemove = currentUser.role === 'superadmin' ||
                     session.instructor.toString() === currentUser._id.toString() ||
                     (currentUser.role === 'admin' && session.institute?.toString() === currentUser.institute?.toString());

    if (!canRemove) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const attendance = session.attendance.find(
      a => a.user.toString() === userId && !a.leaveTime
    );
    
    if (attendance) {
      attendance.leaveTime = new Date();
      attendance.duration = Math.round((attendance.leaveTime - attendance.joinTime) / 60000);
      await session.save();
    }
    
    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
