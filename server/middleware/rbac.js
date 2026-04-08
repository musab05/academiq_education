/**
 * RBAC (Role-Based Access Control) Middleware
 *
 * Role Hierarchy:
 * - superadmin: Full system access (developer level)
 * - admin: Users who own/manage an institute
 * - instructor: Users who have created courses/classrooms
 * - student: Default role for all users (enrolled in courses)
 *
 * Context-Based Access:
 * - A user can be a student for one course but instructor for another
 * - Role is determined by ownership/enrollment in specific resources
 */

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
};

// Role hierarchy level for comparison
const ROLE_LEVEL = {
  superadmin: 4,
  admin: 3,
  instructor: 2,
  student: 1,
};

/**
 * Check if user has at least the required role level
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied",
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Check if user has at least the minimum role level
 */
export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userLevel = ROLE_LEVEL[req.user.role] || 0;
    const requiredLevel = ROLE_LEVEL[minRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: "Insufficient permissions",
        requiredMinRole: minRole,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Check ownership or hierarchical access to a resource
 */
export const checkOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      const { id, slug, departmentId, courseId } = req.params;
      const resourceId = id || slug || departmentId || courseId;

      // Superadmin has full access
      if (req.user.role === ROLES.SUPERADMIN) {
        return next();
      }

      // Import model dynamically
      const model = await import(`../models/${modelName}.js`);
      const Model = model.default;

      // Find resource
      const resource = await Model.findOne(
        slug ? { slug } : { _id: resourceId },
      );

      if (!resource) {
        return res.status(404).json({ error: `${modelName} not found` });
      }

      // Check ownership based on model structure
      const ownerId =
        resource.author?._id ||
        resource.author ||
        resource.instructor?._id ||
        resource.instructor ||
        resource.createdBy?._id ||
        resource.createdBy;

      // Check if user is the owner
      if (ownerId && ownerId.toString() === req.user._id.toString()) {
        req.isOwner = true;
        return next();
      }

      // Admin can access resources within their institute
      if (req.user.role === ROLES.ADMIN && req.user.institute) {
        if (
          resource.institute &&
          resource.institute.toString() === req.user.institute.toString()
        ) {
          return next();
        }
      }

      // Check if user is enrolled (has student access)
      if (modelName === "Course") {
        const Enrollment = (await import("../models/Enrollment.js")).default;
        const enrollment = await Enrollment.findOne({
          course: resource._id,
          enrolleeId: req.user._id,
          enrolleeType: "user",
          isActive: true,
        });
        if (enrollment) {
          req.isEnrolled = true;
          return next();
        }
      }

      // Instructor can access their own courses
      if (req.user.role === ROLES.INSTRUCTOR) {
        if (ownerId && ownerId.toString() === req.user._id.toString()) {
          return next();
        }
      }

      return res.status(403).json({ error: "Access denied" });
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  };
};

/**
 * Check if user can create resources
 * Now allows any authenticated user to create courses (auto-promotes to instructor)
 */
export const canCreate = (resourceType) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Define creation permissions
    const permissions = {
      // Any authenticated user can create courses/classrooms (will be auto-promoted)
      course: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT],
      classroom: [
        ROLES.SUPERADMIN,
        ROLES.ADMIN,
        ROLES.INSTRUCTOR,
        ROLES.STUDENT,
      ],
      // Institute creation - any user can create (will be auto-promoted to admin)
      institute: [
        ROLES.SUPERADMIN,
        ROLES.ADMIN,
        ROLES.INSTRUCTOR,
        ROLES.STUDENT,
      ],
      // Admin-only resources
      category: [ROLES.SUPERADMIN, ROLES.ADMIN],
      department: [ROLES.SUPERADMIN, ROLES.ADMIN],
      // Lesson creation requires being course owner (checked separately)
      lesson: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.INSTRUCTOR],
      // User management
      user: [ROLES.SUPERADMIN, ROLES.ADMIN],
    };

    if (!permissions[resourceType]?.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied",
        message: `You need one of these roles to create ${resourceType}: ${permissions[resourceType]?.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Check if user is the course instructor/owner
 */
export const isCourseInstructor = async (req, res, next) => {
  try {
    const { courseId, id, slug } = req.params;
    const identifier = courseId || id || slug;

    if (req.user.role === ROLES.SUPERADMIN) {
      return next();
    }

    const Course = (await import("../models/Course.js")).default;
    const course = await Course.findOne(
      slug ? { slug: identifier } : { _id: identifier },
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const isAuthor = course.author.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === ROLES.ADMIN &&
      req.user.institute &&
      course.institute?.toString() === req.user.institute.toString();

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Only the course instructor can perform this action" });
    }

    req.course = course;
    next();
  } catch (error) {
    console.error("Course instructor check error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Check if user is institute admin
 */
export const isInstituteAdmin = async (req, res, next) => {
  try {
    const { instituteId, id } = req.params;
    const identifier = instituteId || id;

    if (req.user.role === ROLES.SUPERADMIN) {
      return next();
    }

    const Institute = (await import("../models/Institute.js")).default;
    const institute = await Institute.findById(identifier);

    if (!institute) {
      return res.status(404).json({ error: "Institute not found" });
    }

    if (institute.admin.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Only the institute admin can perform this action" });
    }

    req.institute = institute;
    next();
  } catch (error) {
    console.error("Institute admin check error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Check if user is enrolled in course
 */
export const isEnrolled = async (req, res, next) => {
  try {
    const { courseId, id, slug } = req.params;

    // Higher roles have access
    if ([ROLES.SUPERADMIN, ROLES.ADMIN].includes(req.user.role)) {
      return next();
    }

    const Course = (await import("../models/Course.js")).default;
    const course = await Course.findOne(
      slug ? { slug } : { _id: courseId || id },
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Course author always has access
    if (course.author.toString() === req.user._id.toString()) {
      req.isInstructor = true;
      return next();
    }

    const Enrollment = (await import("../models/Enrollment.js")).default;
    const enrollment = await Enrollment.findOne({
      course: course._id,
      enrolleeId: req.user._id,
      enrolleeType: "user",
      isActive: true,
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ error: "You must be enrolled in this course" });
    }

    req.enrollment = enrollment;
    req.isEnrolled = true;
    next();
  } catch (error) {
    console.error("Enrollment check error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Students have read-only access to certain resources
 */
export const readOnly = (req, res, next) => {
  if (req.user.role === ROLES.STUDENT && req.method !== "GET") {
    return res
      .status(403)
      .json({ error: "Students have read-only access to this resource" });
  }
  next();
};

/**
 * Helper to get user's effective role for a specific course
 */
export const getCourseRole = async (userId, courseId) => {
  try {
    const Course = (await import("../models/Course.js")).default;
    const course = await Course.findById(courseId);

    if (!course) return null;

    // Check if user is the author (instructor)
    if (course.author.toString() === userId.toString()) {
      return "instructor";
    }

    // Check if enrolled (student)
    const Enrollment = (await import("../models/Enrollment.js")).default;
    const enrollment = await Enrollment.findOne({
      course: courseId,
      enrolleeId: userId,
      enrolleeType: "user",
      isActive: true,
    });

    if (enrollment) return "student";

    return null;
  } catch (error) {
    console.error("Get course role error:", error);
    return null;
  }
};
