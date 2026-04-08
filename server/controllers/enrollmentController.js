import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Progress from "../models/Progress.js";

// Ensure User model is registered with Mongoose
// This is needed for populate operations to work correctly
if (!User) {
  throw new Error("User model not loaded");
}

// Get all enrollments with filtering
export const getEnrollments = async (req, res) => {
  try {
    const {
      enrolleeType,
      enrolleeId,
      courseId,
      courseSlug,
      status,
      enrollmentSource,
      page = 1,
      limit = 10,
      search,
    } = req.query;
    const currentUser = req.user;

    const filter = { isActive: true };

    if (enrolleeType) filter.enrolleeType = enrolleeType;
    if (enrolleeId) filter.enrolleeId = enrolleeId;
    if (courseId) filter.course = courseId;

    console.log("DEBUG getEnrollments:", {
      enrolleeType,
      enrolleeId,
      courseId,
      userRole: currentUser?.role,
      userId: currentUser?._id,
    });

    // For team enrollments, only show enrollments for teams where user is a member
    // Superadmins can see all team enrollments
    // Only apply this filter if no specific enrolleeId was requested
    if (
      enrolleeType === "team" &&
      !enrolleeId &&
      currentUser.role !== "superadmin"
    ) {
      console.log(
        "Filtering team enrollments for user:",
        currentUser._id,
        "role:",
        currentUser.role,
      );
      const userTeams = await Team.find({
        isActive: { $ne: false }, // More lenient: allow true or undefined
        "members.user": currentUser._id,
      }).select("_id");
      console.log(
        "Found user teams:",
        userTeams.length,
        userTeams.map((t) => t._id),
      );
      const userTeamIds = userTeams.map((t) => t._id);
      if (userTeamIds.length === 0) {
        // User is not in any teams, return empty result
        filter.enrolleeId = { $in: [] };
      } else {
        filter.enrolleeId = { $in: userTeamIds };
      }
      console.log("Final filter:", JSON.stringify(filter));
    }
    if (courseSlug) {
      const course = await Course.findOne({ slug: courseSlug });
      if (course) filter.course = course._id;
    }
    if (status) filter.status = status;
    if (enrollmentSource) filter.enrollmentSource = enrollmentSource;

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, "i");
      const courses = await Course.find({
        $or: [{ title: searchRegex }, { description: searchRegex }],
      }).select("_id");

      const courseIds = courses.map((course) => course._id);
      filter.$or = [{ course: { $in: courseIds } }];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await Enrollment.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Build population array - only populate enrollee data since course context is known
    const populateArray = [
      {
        path: "enrolledBy",
        select: "firstName lastName email role",
      },
    ];

    // Add enrolleeId population - different fields for users vs teams
    if (enrolleeType === "user") {
      populateArray.push({
        path: "enrolleeId",
        select: "firstName lastName email role",
      });
    } else if (enrolleeType === "team") {
      populateArray.push({
        path: "enrolleeId",
        select: "name description members createdBy",
        populate: {
          path: "members.user",
          select: "firstName lastName email",
        },
      });
    } else {
      // For mixed queries (no enrolleeType filter), populate all fields
      populateArray.push({
        path: "enrolleeId",
        select: "firstName lastName email role name description members",
      });
    }

    // Execute query with manual pagination
    const enrollments = await Enrollment.find(filter)
      .populate("course", "title slug thumbnail categories level duration")
      .populate(populateArray)
      .populate("teamMemberProgress.user", "firstName lastName email")
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Manually populate progress for each enrollment
    for (let i = 0; i < enrollments.length; i++) {
      if (enrollments[i].enrolleeType === "user" && enrollments[i].enrolleeId) {
        const progressDoc = await Progress.findOne({
          user: enrollments[i].enrolleeId._id,
          course: enrollments[i].course,
        });
        // Extract just the progress number, not the entire document
        enrollments[i].progress = progressDoc?.progress || 0;
      }
    }

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        page: pageNum,
        pages: totalPages,
        total: total,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch enrollments",
    });
  }
};

// Get enrollment by ID
export const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id)
      .populate("course", "title slug thumbnail categories level")
      .populate("enrolledBy", "firstName lastName email role")
      .populate("enrolleeId")
      .populate("teamMemberProgress.user", "firstName lastName email");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: "Enrollment not found",
      });
    }

    res.json({ success: true, data: enrollment });
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch enrollment",
    });
  }
};

// Create new enrollment
export const createEnrollment = async (req, res) => {
  try {
    const { enrolleeType, enrolleeId, courseId, notes } = req.body;
    const currentUser = req.user;

    let enrollmentSource;
    switch (currentUser.role) {
      case "admin":
        enrollmentSource = "admin";
        break;
      case "instructor":
        enrollmentSource = "instructor";
        break;
      case "manager":
        enrollmentSource = "manager";
        break;
      default:
        enrollmentSource = "self";
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    const finalEnrolleeId = enrolleeId || currentUser._id;
    const finalEnrolleeType = enrolleeType || "user";

    let enrollee;
    if (finalEnrolleeType === "user") {
      enrollee = await User.findById(finalEnrolleeId);
    } else if (finalEnrolleeType === "team") {
      enrollee = await Team.findById(finalEnrolleeId).populate("members.user");
    }

    if (!enrollee) {
      return res.status(404).json({
        success: false,
        error: `${finalEnrolleeType} not found`,
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      enrolleeType: finalEnrolleeType,
      enrolleeId: finalEnrolleeId,
      course: courseId,
      isActive: true,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: "Enrollment already exists",
      });
    }

    const enrollmentData = {
      enrolleeType: finalEnrolleeType,
      enrolleeId: finalEnrolleeId,
      enrolleeModel: finalEnrolleeType === "user" ? "User" : "Team",
      course: courseId,
      enrolledBy: currentUser._id,
      enrollmentSource,
      notes,
    };

    if (finalEnrolleeType === "team" && enrollee.members) {
      enrollmentData.teamMemberProgress = enrollee.members.map((member) => ({
        user: member.user._id,
        progress: 0,
        status: "active",
      }));
    }

    const enrollment = new Enrollment(enrollmentData);
    await enrollment.save();

    await enrollment.populate([
      { path: "course", select: "title slug thumbnail" },
      { path: "enrolledBy", select: "firstName lastName email" },
      { path: "enrolleeId" },
    ]);

    res.status(201).json({
      success: true,
      data: enrollment,
      message: "Enrollment created successfully",
    });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create enrollment",
    });
  }
};

// Update enrollment
export const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: "Enrollment not found",
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      "status",
      "progress",
      "notes",
      "teamMemberProgress",
    ];
    const updateData = {};

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // Update completion date if status changes to completed
    if (updates.status === "completed" && enrollment.status !== "completed") {
      updateData.completedAt = new Date();
    }

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    ).populate([
      { path: "course", select: "title slug thumbnail" },
      { path: "enrolledBy", select: "firstName lastName email" },
      { path: "enrolleeId" },
    ]);

    res.json({
      success: true,
      data: updatedEnrollment,
      message: "Enrollment updated successfully",
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update enrollment",
    });
  }
};

// Delete enrollment (soft delete)
export const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: "Enrollment not found",
      });
    }

    enrollment.isActive = false;
    await enrollment.save();

    res.json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete enrollment",
    });
  }
};

// Get user's enrollments
export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Find user by _id
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const filter = {
      enrolleeType: "user",
      enrolleeId: user._id,
      isActive: true,
    };

    if (status) filter.status = status;

    const enrollments = await Enrollment.find(filter)
      .populate("course", "title slug thumbnail categories level duration")
      .populate("enrolledBy", "firstName lastName")
      .sort({ enrolledAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments(filter);

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user enrollments",
    });
  }
};

// Get team's enrollments
export const getTeamEnrollments = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {
      enrolleeType: "team",
      enrolleeId: teamId,
      isActive: true,
    };

    if (status) filter.status = status;

    const enrollments = await Enrollment.find(filter)
      .populate("course", "title slug thumbnail categories level duration")
      .populate("enrolledBy", "firstName lastName")
      .populate("teamMemberProgress.user", "firstName lastName email")
      .sort({ enrolledAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments(filter);

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching team enrollments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch team enrollments",
    });
  }
};

// Bulk enroll users/teams
export const bulkEnroll = async (req, res) => {
  try {
    const { enrollments } = req.body; // Array of enrollment objects
    const currentUser = req.user;

    // Automatically determine enrollment source based on user role
    let enrollmentSource;
    switch (currentUser.role) {
      case "admin":
        enrollmentSource = "admin";
        break;
      case "instructor":
        enrollmentSource = "instructor";
        break;
      case "manager":
        enrollmentSource = "manager";
        break;
      default:
        enrollmentSource = "self";
    }

    const results = [];
    const errors = [];

    for (const enrollmentData of enrollments) {
      try {
        const { enrolleeType, enrolleeId, courseId } = enrollmentData;

        // Check if enrollment already exists
        const existingEnrollment = await Enrollment.findOne({
          enrolleeType,
          enrolleeId,
          course: courseId,
          isActive: true,
        });

        if (existingEnrollment) {
          errors.push({
            enrolleeId,
            error: "Enrollment already exists",
          });
          continue;
        }

        const enrollment = new Enrollment({
          enrolleeType,
          enrolleeId,
          enrolleeModel: enrolleeType === "user" ? "User" : "Team",
          course: courseId,
          enrolledBy: currentUser._id,
          enrollmentSource,
        });

        await enrollment.save();
        results.push(enrollment);
      } catch (error) {
        errors.push({
          enrolleeId: enrollmentData.enrolleeId,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      },
      message: `Bulk enrollment completed: ${results.length} successful, ${errors.length} failed`,
    });
  } catch (error) {
    console.error("Error in bulk enrollment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process bulk enrollment",
    });
  }
};

// Get team enrollment details for reports
export const getTeamEnrollmentDetails = async (req, res) => {
  try {
    const { courseSlug, teamId } = req.params;

    const course = await Course.findOne({ slug: courseSlug });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const team = await Team.findById(teamId).populate(
      "members.user",
      "firstName lastName email",
    );
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const enrollment = await Enrollment.findOne({
      course: course._id,
      enrolleeType: "team",
      enrolleeId: teamId,
      isActive: true,
    }).populate("teamMemberProgress.user", "firstName lastName email");

    if (!enrollment) {
      return res.status(404).json({ error: "Team enrollment not found" });
    }

    res.json({
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
      },
      enrollment,
      memberProgress: enrollment.teamMemberProgress || [],
    });
  } catch (error) {
    console.error("Error fetching team enrollment details:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get global reports
export const getGlobalReports = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments({
      enrolleeType: "user",
      isActive: true,
    });
    const enrolledUserIds = await Enrollment.distinct("enrolleeId", {
      enrolleeType: "user",
      isActive: true,
    });
    const totalUsers = enrolledUserIds.length;

    // Course stats
    const courses = await Course.find().select("_id title");
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.find({
          course: course._id,
          enrolleeType: "user",
          isActive: true,
        });

        let totalProgress = 0;
        let completedCount = 0;

        for (const enrollment of enrollments) {
          const progress = await Progress.findOne({
            user: enrollment.enrolleeId,
            course: course._id,
          });
          if (progress) {
            totalProgress += progress.progress || 0;
            if (progress.status === "completed") completedCount++;
          }
        }

        const avgProgress =
          enrollments.length > 0
            ? Math.round(totalProgress / enrollments.length)
            : 0;
        const completionRate =
          enrollments.length > 0
            ? Math.round((completedCount / enrollments.length) * 100)
            : 0;

        return {
          courseId: course._id,
          courseTitle: course.title,
          enrolledUsers: enrollments.length,
          avgProgress,
          completionRate,
        };
      }),
    );

    // User stats
    const users = await User.find({ _id: { $in: enrolledUserIds } }).select(
      "_id firstName lastName email",
    );
    const userStats = await Promise.all(
      users.map(async (user) => {
        const enrollments = await Enrollment.find({
          enrolleeId: user._id,
          enrolleeType: "user",
          isActive: true,
        });

        let totalProgress = 0;
        let completedCount = 0;
        let inProgressCount = 0;

        for (const enrollment of enrollments) {
          const progress = await Progress.findOne({
            user: user._id,
            course: enrollment.course,
          });
          if (progress) {
            totalProgress += progress.progress || 0;
            if (progress.status === "completed") completedCount++;
            else if (progress.progress > 0) inProgressCount++;
          }
        }

        const avgProgress =
          enrollments.length > 0
            ? Math.round(totalProgress / enrollments.length)
            : 0;

        return {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          enrolledCourses: enrollments.length,
          completedCourses: completedCount,
          inProgressCourses: inProgressCount,
          avgProgress,
        };
      }),
    );

    res.json({
      stats: {
        totalCourses,
        totalUsers,
        totalEnrollments,
      },
      courseStats,
      userStats,
    });
  } catch (error) {
    console.error("Error fetching global reports:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get course enrollment details
export const getCourseEnrollmentDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const enrollments = await Enrollment.find({
      course: courseId,
      enrolleeType: "user",
      isActive: true,
    })
      .populate("enrolleeId", "firstName lastName email")
      .lean();

    for (let i = 0; i < enrollments.length; i++) {
      const progressDoc = await Progress.findOne({
        user: enrollments[i].enrolleeId._id,
        course: courseId,
      });
      enrollments[i].user = enrollments[i].enrolleeId;
      enrollments[i].progress = progressDoc?.progress || 0;
    }

    res.json({
      course: {
        _id: course._id,
        title: course.title,
      },
      enrollments,
    });
  } catch (error) {
    console.error("Error fetching course enrollment details:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user enrollment details
export const getUserEnrollmentDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("firstName lastName email");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const enrollments = await Enrollment.find({
      enrolleeId: userId,
      enrolleeType: "user",
      isActive: true,
    })
      .populate("course", "title slug")
      .lean();

    for (let i = 0; i < enrollments.length; i++) {
      const progressDoc = await Progress.findOne({
        user: userId,
        course: enrollments[i].course._id,
      });
      enrollments[i].progress = progressDoc?.progress || 0;
    }

    res.json({
      user,
      enrollments,
    });
  } catch (error) {
    console.error("Error fetching user enrollment details:", error);
    res.status(500).json({ error: "Server error" });
  }
};
