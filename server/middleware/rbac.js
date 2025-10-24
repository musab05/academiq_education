// Role hierarchy: superadmin > admin > instructor > student
const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
};

// Check if user has required role
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

// Check ownership or admin access
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
        slug ? { slug } : { _id: resourceId }
      );

      if (!resource) {
        return res.status(404).json({ error: `${modelName} not found` });
      }

      // Check ownership based on model structure
      const ownerId = resource.author?._id || resource.author || 
                      resource.createdBy?._id || resource.createdBy;

      // Admin can access resources created by instructors/students
      if (req.user.role === ROLES.ADMIN) {
        if (!ownerId) return next(); // No owner, admin can access
        
        const ownerModel = await import('../models/User.js');
        const owner = await ownerModel.default.findById(ownerId);
        
        if (owner && (owner.role === ROLES.INSTRUCTOR || owner.role === ROLES.STUDENT)) {
          return next();
        }
        
        // Admin can access their own resources
        if (ownerId.toString() === req.user._id.toString()) {
          return next();
        }
      }

      // Instructor can access resources created by students
      if (req.user.role === ROLES.INSTRUCTOR) {
        if (!ownerId) return res.status(403).json({ error: 'Access denied' });
        
        const ownerModel = await import('../models/User.js');
        const owner = await ownerModel.default.findById(ownerId);
        
        if (owner && owner.role === ROLES.STUDENT) {
          return next();
        }
        
        // Instructor can access their own resources
        if (ownerId.toString() === req.user._id.toString()) {
          return next();
        }
      }

      // Check if user is the owner
      if (ownerId && ownerId.toString() === req.user._id.toString()) {
        return next();
      }

      return res.status(403).json({ error: 'Access denied' });
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  };
};

// Check if user can create resources
export const canCreate = (resourceType) => {
  return (req, res, next) => {
    const permissions = {
      user: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.INSTRUCTOR],
      course: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.INSTRUCTOR],
      category: [ROLES.SUPERADMIN, ROLES.ADMIN],
      department: [ROLES.SUPERADMIN, ROLES.ADMIN],
      lesson: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.INSTRUCTOR]
    };

    if (!permissions[resourceType]?.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

// Students have read-only access
export const readOnly = (req, res, next) => {
  if (req.user.role === ROLES.STUDENT && req.method !== 'GET') {
    return res.status(403).json({ error: 'Students have read-only access' });
  }
  next();
};
