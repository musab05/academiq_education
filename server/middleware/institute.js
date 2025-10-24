import Institute from '../models/Institute.js';

// Extract domain from email
export const extractDomain = (email) => {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : null;
};

// Auto-assign institute based on email domain
export const autoAssignInstitute = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next();
    }

    const domain = extractDomain(email);
    if (!domain) {
      return next();
    }

    // Find institute by domain
    const institute = await Institute.findOne({ domain, isActive: true });
    
    if (institute) {
      req.body.institute = institute._id;
      req.instituteInfo = institute;
    }

    next();
  } catch (error) {
    console.error('Auto-assign institute error:', error);
    next();
  }
};

// Filter data by institute (for admins)
export const filterByInstitute = async (req, res, next) => {
  try {
    // Superadmin sees everything
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Admin sees only their institute's data
    if (req.user.role === 'admin' && req.user.institute) {
      req.instituteFilter = { institute: req.user.institute };
    }

    next();
  } catch (error) {
    console.error('Filter by institute error:', error);
    next();
  }
};

// Check institute limits
export const checkInstituteLimits = (limitType) => {
  return async (req, res, next) => {
    try {
      // Superadmin bypasses limits
      if (req.user.role === 'superadmin') {
        return next();
      }

      if (!req.user.institute) {
        return next();
      }

      const institute = await Institute.findById(req.user.institute);
      if (!institute) {
        return next();
      }

      // Check specific limit
      if (limitType === 'users') {
        const User = (await import('../models/User.js')).default;
        const userCount = await User.countDocuments({ institute: institute._id });
        if (userCount >= institute.limits.maxUsers) {
          return res.status(403).json({ error: 'User limit reached for this institute' });
        }
      } else if (limitType === 'courses') {
        const Course = (await import('../models/Course.js')).default;
        const courseCount = await Course.countDocuments({ institute: institute._id });
        if (courseCount >= institute.limits.maxCourses) {
          return res.status(403).json({ error: 'Course limit reached for this institute' });
        }
      }

      next();
    } catch (error) {
      console.error('Check limits error:', error);
      next();
    }
  };
};
