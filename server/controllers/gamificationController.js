import Gamification from "../models/Gamification.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import {
  recordActivity,
  getUserActivities,
} from "../services/activityService.js";

const BADGES = {
  // Beginner Badges
  FIRST_LESSON: {
    badgeId: "first_lesson",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "🎯",
    xp: 10,
    tier: "bronze",
  },
  FIRST_COURSE: {
    badgeId: "first_course",
    name: "Course Starter",
    description: "Complete your first course",
    icon: "📚",
    xp: 50,
    tier: "bronze",
  },
  FIRST_QUIZ: {
    badgeId: "first_quiz",
    name: "Quiz Novice",
    description: "Complete your first quiz",
    icon: "📝",
    xp: 15,
    tier: "bronze",
  },
  TEAM_PLAYER: {
    badgeId: "team_player",
    name: "Team Player",
    description: "Join your first team",
    icon: "👥",
    xp: 15,
    tier: "bronze",
  },

  // Streak Badges
  STREAK_3: {
    badgeId: "streak_3",
    name: "Getting Started",
    description: "3-day learning streak",
    icon: "🔥",
    xp: 15,
    tier: "bronze",
  },
  STREAK_7: {
    badgeId: "streak_7",
    name: "Week Warrior",
    description: "7-day learning streak",
    icon: "🔥",
    xp: 30,
    tier: "silver",
  },
  STREAK_14: {
    badgeId: "streak_14",
    name: "Fortnight Fighter",
    description: "14-day learning streak",
    icon: "🔥",
    xp: 60,
    tier: "silver",
  },
  STREAK_30: {
    badgeId: "streak_30",
    name: "Monthly Master",
    description: "30-day learning streak",
    icon: "⚡",
    xp: 100,
    tier: "gold",
  },
  STREAK_100: {
    badgeId: "streak_100",
    name: "Century Champion",
    description: "100-day learning streak",
    icon: "💎",
    xp: 500,
    tier: "diamond",
  },

  // Quiz Badges
  QUIZ_PERFECT: {
    badgeId: "quiz_perfect",
    name: "Perfect Score",
    description: "Score 100% on a quiz",
    icon: "💯",
    xp: 20,
    tier: "silver",
  },
  QUIZ_MASTER_5: {
    badgeId: "quiz_master_5",
    name: "Quiz Master",
    description: "Score 100% on 5 quizzes",
    icon: "🎓",
    xp: 75,
    tier: "gold",
  },
  QUIZ_LEGEND_10: {
    badgeId: "quiz_legend_10",
    name: "Quiz Legend",
    description: "Score 100% on 10 quizzes",
    icon: "👑",
    xp: 150,
    tier: "diamond",
  },

  // Course Completion Badges
  COURSES_3: {
    badgeId: "courses_3",
    name: "Learning Enthusiast",
    description: "Complete 3 courses",
    icon: "📖",
    xp: 100,
    tier: "silver",
  },
  COURSES_5: {
    badgeId: "courses_5",
    name: "Knowledge Seeker",
    description: "Complete 5 courses",
    icon: "🎓",
    xp: 200,
    tier: "gold",
  },
  COURSES_10: {
    badgeId: "courses_10",
    name: "Course Conqueror",
    description: "Complete 10 courses",
    icon: "🏆",
    xp: 500,
    tier: "diamond",
  },

  // Speed & Efficiency Badges
  SPEED_LEARNER: {
    badgeId: "speed_learner",
    name: "Speed Learner",
    description: "Complete 5 lessons in one day",
    icon: "🚀",
    xp: 25,
    tier: "silver",
  },
  NIGHT_OWL: {
    badgeId: "night_owl",
    name: "Night Owl",
    description: "Complete lessons after 10 PM",
    icon: "🦉",
    xp: 20,
    tier: "bronze",
  },
  EARLY_BIRD: {
    badgeId: "early_bird",
    name: "Early Bird",
    description: "Complete lessons before 6 AM",
    icon: "🌅",
    xp: 20,
    tier: "bronze",
  },

  // Engagement Badges
  SOCIAL_BUTTERFLY: {
    badgeId: "social_butterfly",
    name: "Social Butterfly",
    description: "Join 3 teams",
    icon: "🦋",
    xp: 40,
    tier: "silver",
  },
  HELPFUL_HAND: {
    badgeId: "helpful_hand",
    name: "Helpful Hand",
    description: "Help 5 team members",
    icon: "🤝",
    xp: 50,
    tier: "silver",
  },
  CLASSROOM_STAR: {
    badgeId: "classroom_star",
    name: "Classroom Star",
    description: "Attend 10 live sessions",
    icon: "⭐",
    xp: 75,
    tier: "gold",
  },

  // Achievement Badges
  OVERACHIEVER: {
    badgeId: "overachiever",
    name: "Overachiever",
    description: "Reach level 10",
    icon: "🌟",
    xp: 200,
    tier: "gold",
  },
  LEGEND: {
    badgeId: "legend",
    name: "Legend",
    description: "Reach level 25",
    icon: "👑",
    xp: 500,
    tier: "diamond",
  },
  TOP_10: {
    badgeId: "top_10",
    name: "Top 10",
    description: "Reach top 10 on leaderboard",
    icon: "🥇",
    xp: 100,
    tier: "gold",
  },
  TOP_3: {
    badgeId: "top_3",
    name: "Podium Finish",
    description: "Reach top 3 on leaderboard",
    icon: "🏅",
    xp: 250,
    tier: "diamond",
  },

  // Special Badges
  ASSIGNMENT_ACE: {
    badgeId: "assignment_ace",
    name: "Assignment Ace",
    description: "Submit 10 assignments",
    icon: "📄",
    xp: 60,
    tier: "silver",
  },
  VIDEO_WATCHER: {
    badgeId: "video_watcher",
    name: "Video Enthusiast",
    description: "Watch 20 video lessons",
    icon: "🎬",
    xp: 50,
    tier: "silver",
  },
  CERTIFICATE_COLLECTOR: {
    badgeId: "certificate_collector",
    name: "Certificate Collector",
    description: "Earn 5 certificates",
    icon: "🎖️",
    xp: 150,
    tier: "gold",
  },
};

export const getUserGamification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let gamification = await Gamification.findOne({ user: user._id }).populate(
      "courseXP.course",
      "title",
    );

    if (!gamification) {
      gamification = await Gamification.create({ user: user._id });
    }

    // Calculate stats from actual progress if stats are empty or all zeros
    const statsAreEmpty =
      !gamification.stats ||
      (gamification.stats.lessonsCompleted === 0 &&
        gamification.stats.coursesCompleted === 0 &&
        gamification.stats.quizzesCompleted === 0);

    if (statsAreEmpty) {
      const Progress = (await import("../models/Progress.js")).default;
      const Enrollment = (await import("../models/Enrollment.js")).default;
      const QuizLessonProgress = (
        await import("../models/QuizLessonProgress.js")
      ).default;

      // Count completed lessons
      const completedLessons = await Progress.countDocuments({
        user: user._id,
        lesson: { $exists: true, $ne: null },
        status: "completed",
      });

      // Count completed courses (100% progress)
      const completedCourses = await Enrollment.countDocuments({
        enrolleeId: user._id,
        enrolleeType: "user",
        "progress.percentage": 100,
      });

      // Count completed quizzes
      const completedQuizzes = await QuizLessonProgress.countDocuments({
        user: user._id,
        isCompleted: true,
      });

      // Count perfect quizzes
      const perfectQuizzes = await QuizLessonProgress.countDocuments({
        user: user._id,
        isCompleted: true,
        score: 100,
      });

      // Update gamification stats if we found data
      if (completedLessons > 0 || completedQuizzes > 0) {
        gamification.stats = {
          lessonsCompleted: completedLessons,
          coursesCompleted: completedCourses,
          quizzesCompleted: completedQuizzes,
          perfectQuizzes: perfectQuizzes,
          assignmentsSubmitted: gamification.stats?.assignmentsSubmitted || 0,
          videosWatched: gamification.stats?.videosWatched || 0,
          classroomsAttended: gamification.stats?.classroomsAttended || 0,
          certificatesEarned: gamification.stats?.certificatesEarned || 0,
          teamsJoined: gamification.stats?.teamsJoined || 0,
        };
        gamification.markModified("stats");
        await gamification.save();
      }
    }

    res.json(gamification);
  } catch (error) {
    console.error("Get gamification error:", error);
    res.status(500).json({ error: "Failed to fetch gamification data" });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { type = "global", courseId, teamId, limit = 100 } = req.query;
    const currentUser = await User.findById(req.user._id);
    let leaderboard;
    let userRank = null;

    if (type === "course" && courseId) {
      const allData = await Gamification.find({ "courseXP.course": courseId })
        .populate("user", "firstName lastName profilePicture")
        .lean();

      leaderboard = allData
        .map((g) => ({
          user: g.user,
          xp: g.courseXP.find((c) => c.course.toString() === courseId)?.xp || 0,
          level: g.level,
          badges: g.badges.length,
        }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, parseInt(limit));

      const userEntry = allData.find(
        (g) => g.user._id.toString() === currentUser._id.toString(),
      );
      if (userEntry) {
        const userXP =
          userEntry.courseXP.find((c) => c.course.toString() === courseId)
            ?.xp || 0;
        userRank =
          allData.filter((g) => {
            const xp =
              g.courseXP.find((c) => c.course.toString() === courseId)?.xp || 0;
            return xp > userXP;
          }).length + 1;
      }
    } else if (type === "team" && teamId) {
      const team = await Team.findById(teamId).populate("members.user");
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      const userIds = team.members.map((m) => m.user._id);

      const allData = await Gamification.find({ user: { $in: userIds } })
        .populate("user", "firstName lastName profilePicture")
        .sort({ totalXP: -1 })
        .lean();

      leaderboard = allData.map((g, index) => ({
        rank: index + 1,
        user: g.user,
        xp: g.totalXP,
        level: g.level,
        badges: g.badges.length,
      }));

      const userIndex = allData.findIndex(
        (g) => g.user._id.toString() === currentUser._id.toString(),
      );
      if (userIndex !== -1) {
        userRank = userIndex + 1;
      }
    } else {
      const allData = await Gamification.find()
        .populate("user", "firstName lastName profilePicture")
        .sort({ totalXP: -1 })
        .limit(parseInt(limit))
        .lean();

      leaderboard = allData.map((g, index) => ({
        rank: index + 1,
        user: g.user,
        xp: g.totalXP,
        level: g.level,
        badges: g.badges.length,
      }));

      const totalCount = await Gamification.countDocuments();
      const userEntry = await Gamification.findOne({ user: currentUser._id });
      if (userEntry) {
        const higherRanked = await Gamification.countDocuments({
          totalXP: { $gt: userEntry.totalXP },
        });
        userRank = higherRanked + 1;
      }
    }

    res.json({ leaderboard, userRank, type });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

export const awardXP = async (req, res) => {
  try {
    const { amount, reason, courseId } = req.body;
    const user = await User.findById(req.user._id);

    let gamification = await Gamification.findOne({ user: user._id });
    if (!gamification) {
      gamification = await Gamification.create({ user: user._id });
    }

    const result = gamification.addXP(amount, courseId);
    await gamification.save();

    res.json({
      success: true,
      ...result,
      totalXP: gamification.totalXP,
      level: gamification.level,
    });
  } catch (error) {
    console.error("Award XP error:", error);
    res.status(500).json({ error: "Failed to award XP" });
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
    console.error("Badge award error:", error);
    return null;
  }
};

export const trackStat = async (userId, statType, increment = 1) => {
  try {
    let gamification = await Gamification.findOne({ user: userId });
    if (!gamification) {
      gamification = await Gamification.create({ user: userId });
    }

    if (gamification.stats[statType] !== undefined) {
      gamification.stats[statType] += increment;
      await gamification.save();

      // Check for badge awards based on stats
      await checkStatBadges(gamification);
    }

    return gamification.stats;
  } catch (error) {
    console.error("Track stat error:", error);
    return null;
  }
};

const checkStatBadges = async (gamification) => {
  const stats = gamification.stats;
  const userId = gamification.user;

  // Course completion badges
  if (stats.coursesCompleted === 1)
    await checkAndAwardBadge(userId, "FIRST_COURSE");
  if (stats.coursesCompleted === 3)
    await checkAndAwardBadge(userId, "COURSES_3");
  if (stats.coursesCompleted === 5)
    await checkAndAwardBadge(userId, "COURSES_5");
  if (stats.coursesCompleted === 10)
    await checkAndAwardBadge(userId, "COURSES_10");

  // Quiz badges
  if (stats.quizzesCompleted === 1)
    await checkAndAwardBadge(userId, "FIRST_QUIZ");
  if (stats.perfectQuizzes === 1)
    await checkAndAwardBadge(userId, "QUIZ_PERFECT");
  if (stats.perfectQuizzes === 5)
    await checkAndAwardBadge(userId, "QUIZ_MASTER_5");
  if (stats.perfectQuizzes === 10)
    await checkAndAwardBadge(userId, "QUIZ_LEGEND_10");

  // Other badges
  if (stats.lessonsCompleted === 1)
    await checkAndAwardBadge(userId, "FIRST_LESSON");
  if (stats.assignmentsSubmitted === 10)
    await checkAndAwardBadge(userId, "ASSIGNMENT_ACE");
  if (stats.videosWatched === 20)
    await checkAndAwardBadge(userId, "VIDEO_WATCHER");
  if (stats.certificatesEarned === 5)
    await checkAndAwardBadge(userId, "CERTIFICATE_COLLECTOR");
  if (stats.classroomsAttended === 10)
    await checkAndAwardBadge(userId, "CLASSROOM_STAR");
  if (stats.teamsJoined === 1) await checkAndAwardBadge(userId, "TEAM_PLAYER");
  if (stats.teamsJoined === 3)
    await checkAndAwardBadge(userId, "SOCIAL_BUTTERFLY");

  // Level badges
  if (gamification.level === 10)
    await checkAndAwardBadge(userId, "OVERACHIEVER");
  if (gamification.level === 25) await checkAndAwardBadge(userId, "LEGEND");
};

export const recordActivityEndpoint = async (req, res) => {
  try {
    const { verb, targetType, targetId, metadata } = req.body;
    const user = await User.findById(req.user._id);

    const result = await recordActivity(
      user._id,
      verb,
      targetType,
      targetId,
      metadata,
    );

    res.json(result);
  } catch (error) {
    console.error("Record activity error:", error);
    res.status(500).json({ error: "Failed to record activity" });
  }
};

export const getActivities = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const activities = await getUserActivities(user._id);

    res.json(activities);
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

export const updateStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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

        // Award streak badges
        if (gamification.streak.current === 3)
          await checkAndAwardBadge(user._id, "STREAK_3");
        else if (gamification.streak.current === 7)
          await checkAndAwardBadge(user._id, "STREAK_7");
        else if (gamification.streak.current === 14)
          await checkAndAwardBadge(user._id, "STREAK_14");
        else if (gamification.streak.current === 30)
          await checkAndAwardBadge(user._id, "STREAK_30");
        else if (gamification.streak.current === 100)
          await checkAndAwardBadge(user._id, "STREAK_100");
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
    console.error("Update streak error:", error);
    res.status(500).json({ error: "Failed to update streak" });
  }
};
