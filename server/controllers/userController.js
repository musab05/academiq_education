import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const currentUser = req.user;
    
    // Role-based access control
    const allowedRoles = {
      superadmin: ['superadmin', 'admin', 'instructor', 'student'],
      admin: ['instructor', 'student'],
      instructor: ['student'],
      student: ['student']
    };

    if (!allowedRoles[currentUser.role]) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let query = {};
    
    // Institute filtering for admins - show users from their institute OR users they created
    if (currentUser.role === 'admin') {
      query.$or = [
        { institute: currentUser.institute },
        { createdBy: currentUser._id }
      ];
    }
    
    if (role && allowedRoles[currentUser.role].includes(role)) {
      query.role = role;
    } else if (role) {
      return res.status(403).json({ error: 'Access denied for this role' });
    } else {
      // Show only roles the current user can manage
      query.role = { $in: allowedRoles[currentUser.role] };
    }

    const users = await User.find(query)
      .select('-password')
      .populate('createdBy', 'firstName lastName')
      .populate('institute', 'name domain')
      .sort({ createdAt: -1 });

    const filteredUsers = users.filter(user => {
      if (user.role === 'superadmin' && currentUser.role !== 'superadmin') {
        return false;
      }
      return true;
    });

    res.json(filteredUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const currentUser = req.user;

    // Role-based creation permissions
    const canCreate = {
      superadmin: ['admin', 'instructor', 'student'],
      admin: ['instructor', 'student'],
      instructor: ['student']
    };

    if (!canCreate[currentUser.role] || !canCreate[currentUser.role].includes(role)) {
      return res.status(403).json({ error: 'Access denied to create this role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      firstName,
      lastName,
      username: email, // Use email as username
      email,
      password,
      role,
      createdBy: currentUser._id,
      institute: currentUser.institute || null
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, department, password } = req.body;
    const currentUser = req.user;

    const user = await User.findById(id).populate('createdBy', 'role');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Role-based update permissions
    const canManage = {
      superadmin: ['superadmin', 'admin', 'instructor', 'student'],
      admin: ['admin', 'instructor', 'student'],
      instructor: ['instructor', 'student']
    };

    // Check if current user can manage this user's role
    if (!canManage[currentUser.role] || !canManage[currentUser.role].includes(user.role)) {
      // Allow users to update themselves (except role)
      if (user._id.toString() !== currentUser._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Admin can only update users they created or lower roles
    if (currentUser.role === 'admin' && user.role === 'admin') {
      if (user.createdBy && user.createdBy._id.toString() !== currentUser._id.toString() && 
          user._id.toString() !== currentUser._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    
    // Only allow role change if user has permission
    if (role && canManage[currentUser.role]?.includes(role)) {
      user.role = role;
    }

    // Allow department change
    if (department !== undefined) {
      user.department = department || null;
    }

    // Allow password change for admin and superadmin
    if (password && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
      user.password = password;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const user = await User.findById(id).populate('createdBy', 'role');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion
    if (user._id.toString() === currentUser._id.toString()) {
      return res.status(403).json({ error: 'Cannot delete yourself' });
    }

    // Role-based delete permissions
    const canDelete = {
      superadmin: ['superadmin', 'admin', 'instructor', 'student'],
      admin: ['admin', 'instructor', 'student'],
      instructor: ['instructor', 'student']
    };

    if (!canDelete[currentUser.role] || !canDelete[currentUser.role].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Admin can only delete users they created or lower roles
    if (currentUser.role === 'admin' && user.role === 'admin') {
      if (user.createdBy && user.createdBy._id.toString() !== currentUser._id.toString()) {
        return res.status(403).json({ error: 'Access denied. You can only delete admins you created' });
      }
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Profile management functions
export const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('institute', 'name domain')
      .populate('department', 'name');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const stats = {};

    if (userRole === 'student') {
      const { default: Enrollment } = await import('../models/Enrollment.js');
      const { default: Team } = await import('../models/Team.js');
      
      const enrollments = await Enrollment.find({ user: userId });
      const completedEnrollments = enrollments.filter(e => e.progress === 100);
      const avgProgress = enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
        : 0;
      const teams = await Team.find({ members: userId });
      
      stats.enrolledCourses = enrollments.length;
      stats.completedCourses = completedEnrollments.length;
      stats.teams = teams.length;
      stats.averageProgress = avgProgress;
    } else if (userRole === 'instructor') {
      const { default: Course } = await import('../models/Course.js');
      const { default: Enrollment } = await import('../models/Enrollment.js');
      
      const courses = await Course.find({ instructor: userId });
      const courseIds = courses.map(c => c._id);
      const enrollments = await Enrollment.find({ course: { $in: courseIds } });
      const completedEnrollments = enrollments.filter(e => e.progress === 100);
      const completionRate = enrollments.length > 0
        ? Math.round((completedEnrollments.length / enrollments.length) * 100)
        : 0;
      
      stats.coursesCreated = courses.length;
      stats.totalStudents = new Set(enrollments.map(e => e.user.toString())).size;
      stats.completionRate = completionRate;
      stats.averageRating = 4.5; // Placeholder
    } else if (userRole === 'admin' || userRole === 'superadmin') {
      const { default: Course } = await import('../models/Course.js');
      const { default: Enrollment } = await import('../models/Enrollment.js');
      const { default: Department } = await import('../models/Department.js');
      
      const query = userRole === 'admin' && req.user.institute 
        ? { institute: req.user.institute }
        : {};
      
      const users = await User.countDocuments(query);
      const courses = await Course.countDocuments(query);
      const enrollments = await Enrollment.countDocuments();
      const departments = await Department.countDocuments(query);
      
      stats.totalUsers = users;
      stats.totalCourses = courses;
      stats.activeEnrollments = enrollments;
      stats.departments = departments;
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      username, 
      department, 
      phone, 
      bio, 
      location, 
      timezone, 
      language,
      expertise,
      socialLinks,
      preferences 
    } = req.body;
    const userId = req.user._id;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !username) {
      return res.status(400).json({ error: 'First name, last name, email, and username are required' });
    }
    
    // Check if email is already taken by another user
    const emailExists = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: userId } 
    });
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Check if username is already taken by another user
    const usernameExists = await User.findOne({ 
      username: username.toLowerCase(), 
      _id: { $ne: userId } 
    });
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
    };
    
    // Add optional fields if provided
    if (phone !== undefined) updateData.phone = phone.trim();
    if (bio !== undefined) updateData.bio = bio.trim().substring(0, 500); // Limit bio length
    if (location !== undefined) updateData.location = location.trim();
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.language = language;
    if (expertise !== undefined) updateData.expertise = expertise;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (preferences !== undefined) updateData.preferences = preferences;
    
    // Only update department if provided and user has permission
    if (department && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
      updateData.department = department;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('institute', 'name domain').populate('department', 'name');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const userId = req.user._id;
    
    if (!profilePicture) {
      return res.status(400).json({ error: 'Profile picture URL is required' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture },
      { new: true }
    ).select('-password');
    
    res.json({ profilePicture: updatedUser.profilePicture });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate new avatar URL using user's UUID
    const generateAvatarUrl = uuid => {
      return `https://api.dicebear.com/8.x/thumbs/svg?seed=${uuid}`;
    };
    
    const newProfilePicture = generateAvatarUrl(user.uuid);
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: newProfilePicture },
      { new: true }
    ).select('-password');
    
    res.json({ profilePicture: updatedUser.profilePicture });
  } catch (error) {
    console.error('Error resetting profile picture:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
