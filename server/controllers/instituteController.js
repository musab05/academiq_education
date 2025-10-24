import Institute from '../models/Institute.js';
import User from '../models/User.js';

export const getInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find({ isActive: true })
      .populate('admin', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(institutes);
  } catch (error) {
    console.error('Error fetching institutes:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createInstitute = async (req, res) => {
  try {
    const { name, domain, adminId, description } = req.body;

    if (!name || !domain || !adminId) {
      return res.status(400).json({ error: 'Name, domain, and admin are required' });
    }

    // Validate domain format
    const domainRegex = /^[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }

    // Check if domain already exists
    const existingInstitute = await Institute.findOne({ domain });
    if (existingInstitute) {
      return res.status(400).json({ error: 'Institute with this domain already exists' });
    }

    // Verify admin exists and promote to admin if needed
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
    }

    const institute = new Institute({
      name,
      domain,
      admin: adminId,
      description,
      createdBy: req.user._id,
    });

    await institute.save();
    await institute.populate('admin', 'firstName lastName email');
    await institute.populate('createdBy', 'firstName lastName');

    res.status(201).json(institute);
  } catch (error) {
    console.error('Error creating institute:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain, adminId, description } = req.body;

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    // Validate domain format if changed
    if (domain && domain !== institute.domain) {
      const domainRegex = /^[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return res.status(400).json({ error: 'Invalid domain format' });
      }

      const existingInstitute = await Institute.findOne({ domain });
      if (existingInstitute) {
        return res.status(400).json({ error: 'Institute with this domain already exists' });
      }
    }

    // Verify admin if changed and promote to admin if needed
    if (adminId && adminId !== institute.admin.toString()) {
      const admin = await User.findById(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin user not found' });
      }
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
      }
      institute.admin = adminId;
    }

    if (name) institute.name = name;
    if (domain) institute.domain = domain;
    if (description !== undefined) institute.description = description;

    await institute.save();
    await institute.populate('admin', 'firstName lastName email');
    await institute.populate('createdBy', 'firstName lastName');

    res.json(institute);
  } catch (error) {
    console.error('Error updating institute:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteInstitute = async (req, res) => {
  try {
    const { id } = req.params;

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    await Institute.findByIdAndDelete(id);
    res.json({ message: 'Institute deleted successfully' });
  } catch (error) {
    console.error('Error deleting institute:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
