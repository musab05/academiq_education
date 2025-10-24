import Gamification from '../models/Gamification.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import { recordActivity, getUserActivities } from '../services/activityService.js';

const BADGES = {
  FIRST_LESSON: { badgeId: 'first_lesson', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', xp: 10 },
  FIRST_COURSE: { badgeId: 'first_course', name: 'Course Conqueror', description: 'Complete your first course', icon: '🏆', xp: 50 },
  STREAK_7: { badgeId: 'streak_7', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', xp: 30 },
  STREAK_30: { badgeId: 'streak_30', name: 'Monthly Master', description: '30-day learning streak', icon: '⚡', xp: 100 },
  QUIZ_PERFECT: { badgeId: 'quiz_perfect', name: 'Perfect Score', description: 'Score 100% on a quiz', icon: '💯', xp: 20 },
  SPEED_LEARNER: { badgeId: 'speed_learner', name: 'Speed Learner', description: 'Complete 5 lessons in one day', icon: '🚀', xp: 25 },
  TEAM_PLAYER: { badgeId: 'team_player', name: 'Team Player', description: 'Join your first team', icon: '👥', xp: 15 }
};

export const getUserGamification = async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.user.uuid });
    let gamification = await Gamification.findOne({ user: user._id }).populate('courseXP.course', 'title');
    
    if (!gamification) {
      gamification = await Gamification.create({ user: user._id });
    }
    
    res.json(gamification);
  } catch (error) {
    console.error('Get gamification error:', error);
    res.status(500).json({ error: 'Failed to fetch gamification data' });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { type = 'global', courseId, teamId, limit = 100 } = req.query;
    const currentUser = await User.findOne({ uuid: req.user.uuid });
    let leaderboard;
    let userRank = null;
    
    if (type === 'course' && courseId) {
      const allData = await Gamification.find({ 'courseXP.course': courseId })
        .populate('user', 'firstName lastName profilePicture')
        .lean();
      
      leaderboard = allData
        .map(g => ({
          user: g.user,
          xp: g.courseXP.find(c => c.course.toString() === courseId)?.xp || 0,
          level: g.level,
          badges: g.badges.length
        }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, parseInt(limit));
      
      const userEntry = allData.find(g => g.user._id.toString() === currentUser._id.toString());
      if (userEntry) {
        const userXP = userEntry.courseXP.find(c => c.course.toString() === courseId)?.xp || 0;
        userRank = allData.filter(g => {
          const xp = g.courseXP.find(c => c.course.toString() === courseId)?.xp || 0;
          return xp > userXP;
        }).length + 1;
      }
    } else if (type === 'team' && teamId) {
      const team = await Team.findById(teamId).populate('members.user');
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      const userIds = team.members.map(m => m.user._id);
      
      const allData = await Gamification.find({ user: { $in: userIds } })
        .populate('user', 'firstName lastName profilePicture')
        .sort({ totalXP: -1 })
        .lean();
      
      leaderboard = allData.map((g, index) => ({
        rank: index + 1,
        user: g.user,
        xp: g.totalXP,
        level: g.level,
        badges: g.badges.length
      }));
      
      const userIndex = allData.findIndex(g => g.user._id.toString() === currentUser._id.toString());
      if (userIndex !== -1) {
        userRank = userIndex + 1;
      }
    } else {
      const allData = await Gamification.find()
        .populate('user', 'firstName lastName profilePicture')
        .sort({ totalXP: -1 })
        .limit(parseInt(limit))
        .lean();
      
      leaderboard = allData.map((g, index) => ({
        rank: index + 1,
        user: g.user,
        xp: g.totalXP,
        level: g.level,
        badges: g.badges.length
      }));
      
      const totalCount = await Gamification.countDocuments();
      const userEntry = await Gamification.findOne({ user: currentUser._id });
      if (userEntry) {
        const higherRanked = await Gamification.countDocuments({ totalXP: { $gt: userEntry.totalXP } });
        userRank = higherRanked + 1;
      }
    }
    
    res.json({ leaderboard, userRank, type });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

export const awardXP = async (req, res) => {
  try {
    const { amount, reason, courseId } = req.body;
    const user = await User.findOne({ uuid: req.user.uuid });
    
    let gamification = await Gamification.findOne({ user: user._id });
    if (!gamification) {
      gamification = await Gamification.create({ user: user._id });
    }
    
    const result = gamification.addXP(amount, courseId);
    await gamification.save();
    
    res.json({ success: true, ...result, totalXP: gamification.totalXP, level: gamification.level });
  } catch (error) {
    console.error('Award XP error:', error);
    res.status(500).json({ error: 'Failed to award XP' });
  }
};

export const checkAndAwardBadge = async (userId, badgeKey, courseId = null) => {
  try {
    const gamification = await Gamification.findOne({ user: userId });
    if (!gamification) return null;
    
    const badge = BADGES[badgeKey];
    if (!badge) return null;
    
    const awarded = gamification.addBadge(badge);
    if (awarded) {
      gamification.addXP(badge.xp, courseId);
      await gamification.save();
      return badge;
    }
    
    return null;
  } catch (error) {
    console.error('Badge award error:', error);
    return null;
  }
};

export const recordActivityEndpoint = async (req, res) => {
  try {
    const { verb, targetType, targetId, metadata } = req.body;
    const user = await User.findOne({ uuid: req.user.uuid });
    
    const result = await recordActivity(user._id, verb, targetType, targetId, metadata);
    
    res.json(result);
  } catch (error) {
    console.error('Record activity error:', error);
    res.status(500).json({ error: 'Failed to record activity' });
  }
};

export const getActivities = async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.user.uuid });
    const activities = await getUserActivities(user._id);
    
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

export const updateStreak = async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.user.uuid });
    let gamification = await Gamification.findOne({ user: user._id });
    
    if (!gamification) {
      gamification = await Gamification.create({ user: user._id });
    }
    
    const now = new Date();
    const lastActivity = gamification.streak.lastActivity;
    
    if (lastActivity) {
      const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        gamification.streak.current += 1;
        if (gamification.streak.current > gamification.streak.longest) {
          gamification.streak.longest = gamification.streak.current;
        }
        
        if (gamification.streak.current === 7) {
          await checkAndAwardBadge(user._id, 'STREAK_7');
        } else if (gamification.streak.current === 30) {
          await checkAndAwardBadge(user._id, 'STREAK_30');
        }
      } else if (daysDiff > 1) {
        gamification.streak.current = 1;
      }
    } else {
      gamification.streak.current = 1;
    }
    
    gamification.streak.lastActivity = now;
    await gamification.save();
    
    res.json({ streak: gamification.streak });
  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
};
