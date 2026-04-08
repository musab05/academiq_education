import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Team from "../models/Team.js";
import Classroom from "../models/Classroom.js";
import User from "../models/User.js";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import ScormLessonProgress from "../models/ScormLessonProgress.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Use user _id directly
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get enrollments (user enrollments only)
    const enrollments = await Enrollment.find({
      enrolleeType: "user",
      enrolleeId: userId,
      isActive: true,
    })
      .populate("course")
      .lean();

    // Get teams
    const teams = await Team.find({ "members.user": userId })
      .populate("members.user", "firstName lastName email")
      .lean();

    // Get classrooms
    const classrooms = await Classroom.find({
      $or: [{ instructor: userId }, { enrolledStudents: userId }],
      isActive: true,
    }).lean();

    // Get course progress - calculate from actual lesson completions
    const courseProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        if (!enrollment.course) return null;

        // Get all lessons in this course
        const allLessons = await Lesson.find({
          course: enrollment.course._id,
        }).select("_id type");
        const totalLessons = allLessons.length;

        if (totalLessons === 0) {
          return {
            courseId: enrollment.course._id,
            title: enrollment.course.title,
            thumbnail: enrollment.course.thumbnail,
            progress: 0,
            total: 0,
            completed: 0,
            status: "not_started",
            hasStarted: false,
            enrolledAt: enrollment.enrolledAt,
          };
        }

        // Count completed lessons (regular + SCORM)
        const regularLessonIds = allLessons
          .filter((l) => l.type !== "scorm")
          .map((l) => l._id);
        const scormLessonIds = allLessons
          .filter((l) => l.type === "scorm")
          .map((l) => l._id);

        const [completedRegular, completedScorm, anyProgress] =
          await Promise.all([
            Progress.countDocuments({
              user: userId,
              lesson: { $in: regularLessonIds },
              status: "completed",
            }),
            ScormLessonProgress.countDocuments({
              user: userId,
              lesson: { $in: scormLessonIds },
              isCompleted: true,
            }),
            Progress.findOne({
              user: userId,
              course: enrollment.course._id,
              lesson: { $exists: true },
            }),
          ]);

        const totalCompleted = completedRegular + completedScorm;
        const progress = Math.round((totalCompleted / totalLessons) * 100);
        const hasStarted = anyProgress !== null || totalCompleted > 0;

        return {
          courseId: enrollment.course._id,
          title: enrollment.course.title,
          thumbnail: enrollment.course.thumbnail,
          progress,
          total: totalLessons,
          completed: totalCompleted,
          status:
            progress === 100
              ? "completed"
              : hasStarted
                ? "in_progress"
                : "not_started",
          hasStarted,
          enrolledAt: enrollment.enrolledAt,
        };
      }),
    );

    // Filter out null entries
    const validCourseProgress = courseProgress.filter((cp) => cp !== null);

    // Recent activity from lesson progress (only records with lessons)
    const recentProgress = await Progress.find({
      user: userId,
      lesson: { $exists: true, $ne: null },
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("lesson", "title")
      .populate("course", "title slug")
      .lean();

    // Role-specific stats
    let roleStats = null;

    if (userRole === "admin" || userRole === "superadmin") {
      const [totalUsers, totalCourses, totalEnrollments, totalTeams] =
        await Promise.all([
          User.countDocuments(),
          Course.countDocuments(),
          Enrollment.countDocuments(),
          Team.countDocuments(),
        ]);
      roleStats = { totalUsers, totalCourses, totalEnrollments, totalTeams };
    } else if (userRole === "instructor") {
      const myCourses = await Course.find({ createdBy: userId });
      const myCourseIds = myCourses.map((c) => c._id);
      const [totalStudents, totalEnrollments] = await Promise.all([
        Enrollment.distinct("enrolleeId", {
          course: { $in: myCourseIds },
          enrolleeType: "user",
        }).then((ids) => ids.length),
        Enrollment.countDocuments({ course: { $in: myCourseIds } }),
      ]);
      roleStats = {
        myCourses: myCourses.length,
        totalStudents,
        totalEnrollments,
        myClassrooms: classrooms.filter(
          (c) => c.instructor.toString() === userId.toString(),
        ).length,
      };
    }

    res.json({
      enrollments: validCourseProgress,
      teams: teams.length,
      classrooms: classrooms.length,
      recentActivity: recentProgress,
      roleStats,
      userRole,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};
