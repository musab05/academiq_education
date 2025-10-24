import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Team from '../models/Team.js';
import Classroom from '../models/Classroom.js';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userUuid = req.user.uuid;
    const userRole = req.user.role;

    // Find user by UUID to get ObjectId
    const user = await User.findOne({ uuid: userUuid }).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = user._id;

    // Get enrollments (user enrollments only)
    const enrollments = await Enrollment.find({ 
      enrolleeType: 'user',
      enrolleeId: userId,
      isActive: true
    })
      .populate('course')
      .lean();

    // Get teams
    const teams = await Team.find({ 'members.user': userId })
      .populate('members.user', 'firstName lastName email')
      .lean();

    // Get classrooms
    const classrooms = await Classroom.find({
      $or: [
        { instructor: userId },
        { enrolledStudents: userId }
      ],
      isActive: true
    }).lean();

    // Get course progress
    const courseProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Check for course-level progress record
        const courseProgressRecord = await Progress.findOne({
          user: userId,
          course: enrollment.course._id
        });
        
        return {
          courseId: enrollment.course._id,
          title: enrollment.course.title,
          thumbnail: enrollment.course.thumbnail,
          progress: courseProgressRecord?.progress || 0,
          status: courseProgressRecord?.status || 'not_started',
          hasStarted: courseProgressRecord ? true : false,
          enrolledAt: enrollment.enrolledAt
        };
      })
    );

    // Recent activity from lesson progress
    const recentProgress = await Progress.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('lesson', 'title')
      .lean();

    // Role-specific stats
    let roleStats = null;
    
    if (userRole === 'admin' || userRole === 'superadmin') {
      const [totalUsers, totalCourses, totalEnrollments, totalTeams] = await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Enrollment.countDocuments(),
        Team.countDocuments()
      ]);
      roleStats = { totalUsers, totalCourses, totalEnrollments, totalTeams };
    } else if (userRole === 'instructor') {
      const myCourses = await Course.find({ createdBy: userId });
      const myCourseIds = myCourses.map(c => c._id);
      const [totalStudents, totalEnrollments] = await Promise.all([
        Enrollment.distinct('enrolleeId', { 
          course: { $in: myCourseIds },
          enrolleeType: 'user'
        }).then(ids => ids.length),
        Enrollment.countDocuments({ course: { $in: myCourseIds } })
      ]);
      roleStats = { 
        myCourses: myCourses.length,
        totalStudents,
        totalEnrollments,
        myClassrooms: classrooms.filter(c => c.instructor.toString() === userId.toString()).length
      };
    }

    res.json({
      enrollments: courseProgress,
      teams: teams.length,
      classrooms: classrooms.length,
      recentActivity: recentProgress,
      roleStats,
      userRole
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
