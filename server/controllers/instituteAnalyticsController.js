import Institute from '../models/Institute.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

export const getInstituteAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const institute = await Institute.findById(id).populate('admin', 'firstName lastName email');
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    // Get counts
    const [userCount, courseCount, enrollmentCount] = await Promise.all([
      User.countDocuments({ institute: id }),
      Course.countDocuments({ institute: id }),
      Enrollment.countDocuments({ institute: id }),
    ]);

    // Get user breakdown by role
    const usersByRole = await User.aggregate([
      { $match: { institute: institute._id } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Get recent activity
    const recentUsers = await User.find({ institute: id })
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCourses = await Course.find({ institute: id })
      .select('title author createdAt')
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate usage vs limits
    const usage = {
      users: {
        current: userCount,
        limit: institute.limits.maxUsers,
        percentage: (userCount / institute.limits.maxUsers) * 100,
      },
      courses: {
        current: courseCount,
        limit: institute.limits.maxCourses,
        percentage: (courseCount / institute.limits.maxCourses) * 100,
      },
    };

    res.json({
      institute,
      stats: {
        totalUsers: userCount,
        totalCourses: courseCount,
        totalEnrollments: enrollmentCount,
        usersByRole,
      },
      usage,
      recentActivity: {
        users: recentUsers,
        courses: recentCourses,
      },
    });
  } catch (error) {
    console.error('Error fetching institute analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllInstitutesAnalytics = async (req, res) => {
  try {
    const institutes = await Institute.find({ isActive: true })
      .populate('admin', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const analyticsPromises = institutes.map(async (institute) => {
      const [userCount, courseCount, enrollmentCount] = await Promise.all([
        User.countDocuments({ institute: institute._id }),
        Course.countDocuments({ institute: institute._id }),
        Enrollment.countDocuments({ institute: institute._id }),
      ]);

      return {
        institute: {
          _id: institute._id,
          name: institute.name,
          domain: institute.domain,
          admin: institute.admin,
          subscription: institute.subscription,
        },
        stats: {
          users: userCount,
          courses: courseCount,
          enrollments: enrollmentCount,
        },
        usage: {
          usersPercentage: (userCount / institute.limits.maxUsers) * 100,
          coursesPercentage: (courseCount / institute.limits.maxCourses) * 100,
        },
      };
    });

    const analytics = await Promise.all(analyticsPromises);

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching all institutes analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateInstituteBranding = async (req, res) => {
  try {
    const { id } = req.params;
    const { primaryColor, secondaryColor, customDomain } = req.body;

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    if (primaryColor) institute.branding.primaryColor = primaryColor;
    if (secondaryColor) institute.branding.secondaryColor = secondaryColor;
    if (customDomain !== undefined) institute.branding.customDomain = customDomain;

    await institute.save();
    res.json(institute);
  } catch (error) {
    console.error('Error updating branding:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateInstituteSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { autoEnrollByDomain, allowCrossCourseSharing, customCertificateTemplate } = req.body;

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    if (autoEnrollByDomain !== undefined) institute.settings.autoEnrollByDomain = autoEnrollByDomain;
    if (allowCrossCourseSharing !== undefined) institute.settings.allowCrossCourseSharing = allowCrossCourseSharing;
    if (customCertificateTemplate !== undefined) institute.settings.customCertificateTemplate = customCertificateTemplate;

    await institute.save();
    res.json(institute);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateInstituteLimits = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxUsers, maxCourses, storageGB } = req.body;

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    if (maxUsers) institute.limits.maxUsers = maxUsers;
    if (maxCourses) institute.limits.maxCourses = maxCourses;
    if (storageGB) institute.limits.storageGB = storageGB;

    await institute.save();
    res.json(institute);
  } catch (error) {
    console.error('Error updating limits:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, status, expiresAt } = req.body;

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    if (plan) institute.subscription.plan = plan;
    if (status) institute.subscription.status = status;
    if (expiresAt) institute.subscription.expiresAt = expiresAt;

    await institute.save();
    res.json(institute);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
