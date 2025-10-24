import Team from '../models/Team.js';
import User from '../models/User.js';

export const getTeams = async (req, res) => {
  try {
    const currentUser = req.user;
    const teams = await Team.find({ 
      isActive: true,
      'members.user': currentUser._id
    })
      .populate('members.user', 'firstName lastName email')
      .populate('createdBy', 'uuid firstName lastName')
      .populate('trackedCourses', 'title slug thumbnail')
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const currentUser = req.user;

    const team = new Team({
      name,
      description,
      createdBy: currentUser._id,
      members: [{
        user: currentUser._id,
        role: 'manager'
      }]
    });

    await team.save();
    await team.populate('members.user', 'firstName lastName email');
    await team.populate('createdBy', 'firstName lastName');

    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role = 'member' } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user can manage team
    const userMember = team.members.find(m => m.user.toString() === currentUser._id.toString());
    if (!userMember || userMember.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user already exists in team
    const existingMember = team.members.find(m => m.user.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ error: 'User already in team' });
    }

    team.members.push({ user: userId, role });
    await team.save();
    await team.populate('members.user', 'firstName lastName email');

    res.json(team);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user can manage team
    const userMember = team.members.find(m => m.user.toString() === currentUser._id.toString());
    if (!userMember || userMember.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    team.members = team.members.filter(m => m.user.toString() !== userId);
    await team.save();
    await team.populate('members.user', 'firstName lastName email');

    res.json(team);
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user can manage team
    const userMember = team.members.find(m => m.user.toString() === currentUser._id.toString());
    if (!userMember || userMember.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const member = team.members.find(m => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    member.role = role;
    await team.save();
    await team.populate('members.user', 'firstName lastName email');

    res.json(team);
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user can manage team
    const userMember = team.members.find(m => m.user.toString() === currentUser._id.toString());
    if (!userMember || userMember.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    team.name = name;
    team.description = description;
    await team.save();
    await team.populate('members.user', 'firstName lastName email');
    await team.populate('createdBy', 'firstName lastName');

    res.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Only creator can delete
    if (team.createdBy.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Only team creator can delete the team' });
    }

    await Team.findByIdAndDelete(teamId);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTrackedCourses = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { courseIds } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const userMember = team.members.find(m => m.user.toString() === currentUser._id.toString());
    if (!userMember || userMember.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    team.trackedCourses = courseIds;
    await team.save();
    await team.populate('trackedCourses', 'title slug thumbnail');

    res.json(team);
  } catch (error) {
    console.error('Error updating tracked courses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};