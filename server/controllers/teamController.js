import Team from "../models/Team.js";
import User from "../models/User.js";
import Gamification from "../models/Gamification.js";
import Progress from "../models/Progress.js";
import Enrollment from "../models/Enrollment.js";

export const getTeams = async (req, res) => {
  try {
    const currentUser = req.user;
    const teams = await Team.find({
      isActive: true,
      "members.user": currentUser._id,
    })
      .populate("members.user", "firstName lastName email")
      .populate("createdBy", "firstName lastName")
      .populate("trackedCourses", "title slug thumbnail")
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Server error" });
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
      members: [
        {
          user: currentUser._id,
          role: "manager",
        },
      ],
    });

    await team.save();
    await team.populate("members.user", "firstName lastName email");
    await team.populate("createdBy", "firstName lastName");

    res.status(201).json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role = "member" } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if user can manage team
    const userMember = team.members.find(
      (m) => m.user.toString() === currentUser._id.toString(),
    );
    if (!userMember || userMember.role !== "manager") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if user already exists in team
    const existingMember = team.members.find(
      (m) => m.user.toString() === userId,
    );
    if (existingMember) {
      return res.status(400).json({ error: "User already in team" });
    }

    team.members.push({ user: userId, role });
    await team.save();
    await team.populate("members.user", "firstName lastName email");

    res.json(team);
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if user can manage team
    const userMember = team.members.find(
      (m) => m.user.toString() === currentUser._id.toString(),
    );
    if (!userMember || userMember.role !== "manager") {
      return res.status(403).json({ error: "Access denied" });
    }

    team.members = team.members.filter((m) => m.user.toString() !== userId);
    await team.save();
    await team.populate("members.user", "firstName lastName email");

    res.json(team);
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if user can manage team
    const userMember = team.members.find(
      (m) => m.user.toString() === currentUser._id.toString(),
    );
    if (!userMember || userMember.role !== "manager") {
      return res.status(403).json({ error: "Access denied" });
    }

    const member = team.members.find((m) => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    member.role = role;
    await team.save();
    await team.populate("members.user", "firstName lastName email");

    res.json(team);
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if user can manage team
    const userMember = team.members.find(
      (m) => m.user.toString() === currentUser._id.toString(),
    );
    if (!userMember || userMember.role !== "manager") {
      return res.status(403).json({ error: "Access denied" });
    }

    team.name = name;
    team.description = description;
    await team.save();
    await team.populate("members.user", "firstName lastName email");
    await team.populate("createdBy", "firstName lastName");

    res.json(team);
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Only creator can delete
    if (team.createdBy.toString() !== currentUser._id.toString()) {
      return res
        .status(403)
        .json({ error: "Only team creator can delete the team" });
    }

    await Team.findByIdAndDelete(teamId);
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateTrackedCourses = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { courseIds } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const userMember = team.members.find(
      (m) => m.user.toString() === currentUser._id.toString(),
    );
    if (!userMember || userMember.role !== "manager") {
      return res.status(403).json({ error: "Access denied" });
    }

    team.trackedCourses = courseIds;
    await team.save();
    await team.populate("trackedCourses", "title slug thumbnail");

    res.json(team);
  } catch (error) {
    console.error("Error updating tracked courses:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get team stats and leaderboard
export const getTeamStats = async (req, res) => {
  try {
    const { teamId } = req.params;
    const currentUser = req.user;

    const team = await Team.findById(teamId)
      .populate("members.user", "firstName lastName email profilePicture")
      .populate("trackedCourses", "title slug thumbnail");

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if user is a member
    const isMember = team.members.some(
      (m) => m.user._id.toString() === currentUser._id.toString(),
    );
    if (!isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get gamification data for all members
    const memberIds = team.members.map((m) => m.user._id);
    const gamificationData = await Gamification.find({
      user: { $in: memberIds },
    });

    // Get enrollment progress for tracked courses
    const enrollments = await Enrollment.find({
      enrolleeId: { $in: memberIds },
      enrolleeType: "user",
      course: { $in: team.trackedCourses.map((c) => c._id) },
    });

    // Build member leaderboard
    const memberStats = team.members.map((member) => {
      const userGamification = gamificationData.find(
        (g) => g.user.toString() === member.user._id.toString(),
      );
      const userEnrollments = enrollments.filter(
        (e) => e.enrolleeId.toString() === member.user._id.toString(),
      );

      const totalProgress = userEnrollments.reduce(
        (sum, e) => sum + (e.progress?.percentage || 0),
        0,
      );
      const avgProgress =
        userEnrollments.length > 0
          ? Math.round(totalProgress / userEnrollments.length)
          : 0;
      const completedCourses = userEnrollments.filter(
        (e) => e.progress?.percentage === 100,
      ).length;

      return {
        user: member.user,
        role: member.role,
        joinedAt: member.joinedAt,
        xp: userGamification?.totalXP || 0,
        level: userGamification?.level || 1,
        lessonsCompleted: userGamification?.stats?.lessonsCompleted || 0,
        coursesCompleted: completedCourses,
        quizzesCompleted: userGamification?.stats?.quizzesCompleted || 0,
        avgProgress,
        streak: userGamification?.streak?.current || 0,
        badges: userGamification?.badges?.length || 0,
      };
    });

    // Sort by XP for leaderboard
    memberStats.sort((a, b) => b.xp - a.xp);

    // Calculate team totals
    const teamTotals = {
      totalXP: memberStats.reduce((sum, m) => sum + m.xp, 0),
      totalLessons: memberStats.reduce((sum, m) => sum + m.lessonsCompleted, 0),
      totalCourses: memberStats.reduce((sum, m) => sum + m.coursesCompleted, 0),
      totalQuizzes: memberStats.reduce((sum, m) => sum + m.quizzesCompleted, 0),
      avgProgress:
        memberStats.length > 0
          ? Math.round(
              memberStats.reduce((sum, m) => sum + m.avgProgress, 0) /
                memberStats.length,
            )
          : 0,
      avgLevel:
        memberStats.length > 0
          ? Math.round(
              memberStats.reduce((sum, m) => sum + m.level, 0) /
                memberStats.length,
            )
          : 1,
    };

    // Update team stats
    team.stats = {
      totalXP: teamTotals.totalXP,
      lessonsCompleted: teamTotals.totalLessons,
      coursesCompleted: teamTotals.totalCourses,
      quizzesCompleted: teamTotals.totalQuizzes,
      avgProgress: teamTotals.avgProgress,
      lastActivity: new Date(),
    };
    await team.save();

    res.json({
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        avatar: team.avatar,
        color: team.color,
        memberCount: team.members.length,
        trackedCourses: team.trackedCourses,
        goals: team.goals,
        weeklyChallenge: team.weeklyChallenge,
      },
      leaderboard: memberStats,
      teamTotals,
    });
  } catch (error) {
    console.error("Error fetching team stats:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all teams leaderboard
export const getTeamsLeaderboard = async (req, res) => {
  try {
    const currentUser = req.user;

    // Get teams the user is part of
    const userTeams = await Team.find({
      isActive: true,
      "members.user": currentUser._id,
    }).select("_id");

    const userTeamIds = userTeams.map((t) => t._id);

    // Get all active teams (for global leaderboard) or just user's teams
    const teams = await Team.find({
      isActive: true,
      _id: { $in: userTeamIds },
    })
      .populate("members.user", "firstName lastName")
      .select("name description avatar color members stats createdAt");

    // Get gamification data for all team members
    const allMemberIds = teams.flatMap((t) => t.members.map((m) => m.user._id));
    const gamificationData = await Gamification.find({
      user: { $in: allMemberIds },
    });

    // Calculate team stats
    const teamsWithStats = teams.map((team) => {
      const memberXPs = team.members.map((m) => {
        const gam = gamificationData.find(
          (g) => g.user.toString() === m.user._id.toString(),
        );
        return gam?.totalXP || 0;
      });

      const totalXP = memberXPs.reduce((sum, xp) => sum + xp, 0);
      const avgXP =
        memberXPs.length > 0 ? Math.round(totalXP / memberXPs.length) : 0;

      return {
        _id: team._id,
        name: team.name,
        description: team.description,
        avatar: team.avatar,
        color: team.color,
        memberCount: team.members.length,
        totalXP,
        avgXP,
        stats: team.stats,
        topMembers: team.members
          .map((m) => {
            const gam = gamificationData.find(
              (g) => g.user.toString() === m.user._id.toString(),
            );
            return {
              user: m.user,
              xp: gam?.totalXP || 0,
            };
          })
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 3),
      };
    });

    // Sort by total XP
    teamsWithStats.sort((a, b) => b.totalXP - a.totalXP);

    res.json(teamsWithStats);
  } catch (error) {
    console.error("Error fetching teams leaderboard:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Add team goal
export const addTeamGoal = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description, targetValue, type, deadline } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const userMember = team.members.find(
      (m) => m.user.toString() === currentUser._id.toString(),
    );
    if (!userMember || userMember.role !== "manager") {
      return res.status(403).json({ error: "Only managers can add goals" });
    }

    team.goals.push({
      title,
      description,
      targetValue,
      type,
      deadline: deadline ? new Date(deadline) : null,
    });

    await team.save();
    res.json(team.goals);
  } catch (error) {
    console.error("Error adding team goal:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update team goal progress
export const updateTeamGoal = async (req, res) => {
  try {
    const { teamId, goalId } = req.params;
    const { currentValue, isCompleted } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const goal = team.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    if (currentValue !== undefined) goal.currentValue = currentValue;
    if (isCompleted !== undefined) goal.isCompleted = isCompleted;

    await team.save();
    res.json(team.goals);
  } catch (error) {
    console.error("Error updating team goal:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete team goal
export const deleteTeamGoal = async (req, res) => {
  try {
    const { teamId, goalId } = req.params;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const userMember = team.members.find(
      (m) => m.user.toString() === currentUser._id.toString(),
    );
    if (!userMember || userMember.role !== "manager") {
      return res.status(403).json({ error: "Only managers can delete goals" });
    }

    team.goals = team.goals.filter((g) => g._id.toString() !== goalId);
    await team.save();

    res.json(team.goals);
  } catch (error) {
    console.error("Error deleting team goal:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update team settings (avatar, color)
export const updateTeamSettings = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { avatar, color, name, description } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const userMember = team.members.find(
      (m) => m.user.toString() === currentUser._id.toString(),
    );
    if (!userMember || userMember.role !== "manager") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (avatar !== undefined) team.avatar = avatar;
    if (color !== undefined) team.color = color;
    if (name !== undefined) team.name = name;
    if (description !== undefined) team.description = description;

    await team.save();
    await team.populate("members.user", "firstName lastName email");
    await team.populate("createdBy", "firstName lastName");

    res.json(team);
  } catch (error) {
    console.error("Error updating team settings:", error);
    res.status(500).json({ error: "Server error" });
  }
};
