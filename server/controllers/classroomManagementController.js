import Classroom from '../models/Classroom.js';

export const getClassrooms = async (req, res) => {
  try {
    const currentUser = req.user;
    let query = { isActive: true };
    
    // Superadmin sees all classrooms
    if (currentUser.role === 'superadmin') {
      // No additional filters
    } else {
      // All other users only see classrooms they created
      query.instructor = currentUser._id;
    }
    
    const classrooms = await Classroom.find(query)
      .populate('instructor', 'firstName lastName email')
      .populate('category', 'name')
      .populate('institute', 'name')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
    
    res.json(classrooms);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllPublicClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ 
      isActive: true,
      isPrivate: { $ne: true }
    })
      .populate('instructor', 'firstName lastName email')
      .populate('category', 'name')
      .populate('institute', 'name')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
    
    res.json(classrooms);
  } catch (error) {
    console.error('Error fetching public classrooms:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createClassroom = async (req, res) => {
  try {
    const { title, description, category, department, institute } = req.body;
    const currentUser = req.user;
    
    const classroom = new Classroom({
      title,
      description,
      category,
      instructor: currentUser._id,
      institute: institute || currentUser.institute || null,
      department: department || currentUser.department || null,
      createdBy: currentUser._id,
    });
    
    await classroom.save();
    await classroom.populate('instructor', 'firstName lastName email');
    await classroom.populate('category', 'name');
    await classroom.populate('department', 'name code');
    
    res.status(201).json(classroom);
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { title, description, category, department, maxParticipants, isPrivate, autoEnrollInstituteStudents } = req.body;
    const currentUser = req.user;
    
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    const canEdit = currentUser.role === 'superadmin' ||
                    classroom.instructor.toString() === currentUser._id.toString() ||
                    (currentUser.role === 'admin' && classroom.institute?.toString() === currentUser.institute?.toString());
    
    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (title) classroom.title = title;
    if (description !== undefined) classroom.description = description;
    if (category) classroom.category = category;
    if (department !== undefined) classroom.department = department || null;
    if (maxParticipants !== undefined) classroom.maxParticipants = maxParticipants;
    if (isPrivate !== undefined) classroom.isPrivate = isPrivate;
    if (autoEnrollInstituteStudents !== undefined) classroom.autoEnrollInstituteStudents = autoEnrollInstituteStudents;
    
    await classroom.save();
    await classroom.populate('instructor', 'firstName lastName email');
    await classroom.populate('category', 'name');
    await classroom.populate('department', 'name code');
    
    res.json(classroom);
  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const currentUser = req.user;
    
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    const canDelete = currentUser.role === 'superadmin' ||
                      classroom.instructor.toString() === currentUser._id.toString() ||
                      (currentUser.role === 'admin' && classroom.institute?.toString() === currentUser.institute?.toString());
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await Classroom.findByIdAndDelete(classroomId);
    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const enrollStudent = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const currentUser = req.user;
    const studentId = req.body.studentId || currentUser._id;
    
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    if (classroom.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ error: 'Already enrolled' });
    }
    
    classroom.enrolledStudents.push(studentId);
    await classroom.save();
    
    res.json(classroom);
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unenrollStudent = async (req, res) => {
  try {
    const { classroomId, studentId } = req.params;
    const currentUser = req.user;
    
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    const canUnenroll = currentUser.role === 'superadmin' ||
                        classroom.instructor.toString() === currentUser._id.toString() ||
                        (currentUser.role === 'admin' && classroom.institute?.toString() === currentUser.institute?.toString());
    
    if (!canUnenroll) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    classroom.enrolledStudents = classroom.enrolledStudents.filter(
      id => id.toString() !== studentId
    );
    await classroom.save();
    
    res.json({ message: 'Student unenrolled successfully' });
  } catch (error) {
    console.error('Error unenrolling student:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const enrollTeam = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { teamId } = req.body;
    
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    if (classroom.enrolledTeams.includes(teamId)) {
      return res.status(400).json({ error: 'Team already enrolled' });
    }
    
    classroom.enrolledTeams.push(teamId);
    await classroom.save();
    
    res.json(classroom);
  } catch (error) {
    console.error('Error enrolling team:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unenrollTeam = async (req, res) => {
  try {
    const { classroomId, teamId } = req.params;
    const currentUser = req.user;
    
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    const canUnenroll = currentUser.role === 'superadmin' ||
                        classroom.instructor.toString() === currentUser._id.toString() ||
                        (currentUser.role === 'admin' && classroom.institute?.toString() === currentUser.institute?.toString());
    
    if (!canUnenroll) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    classroom.enrolledTeams = classroom.enrolledTeams.filter(
      id => id.toString() !== teamId
    );
    await classroom.save();
    
    res.json({ message: 'Team unenrolled successfully' });
  } catch (error) {
    console.error('Error unenrolling team:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyClassrooms = async (req, res) => {
  try {
    const currentUser = req.user;
    
    const classrooms = await Classroom.find({
      isActive: true,
      enrolledStudents: currentUser._id
    })
      .populate('instructor', 'firstName lastName email profilePicture')
      .populate('category', 'name')
      .populate('institute', 'name')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
    
    res.json(classrooms);
  } catch (error) {
    console.error('Error fetching enrolled classrooms:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
