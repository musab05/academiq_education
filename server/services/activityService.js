import ActivityEvent from "../models/ActivityEvent.js";
import Gamification from "../models/Gamification.js";
import { calculateXP, calculateLevel, checkDailyCap } from "./xpService.js";

export const recordActivity = async (
  userId,
  verb,
  targetType,
  targetId,
  metadata = {},
) => {
  try {
    // Generate idempotency key
    const idempotencyKey = `${userId}_${verb}_${targetType}_${targetId}_${Date.now()}`;

    // Check if activity already recorded (idempotency)
    const existing = await ActivityEvent.findOne({
      user: userId,
      verb,
      targetType,
      targetId,
      createdAt: { $gte: new Date(Date.now() - 60000) }, // Within last minute
    });

    if (existing) {
      return {
        success: false,
        message: "Activity already recorded",
        xpAwarded: 0,
      };
    }

    // Check daily cap
    const capCheck = await checkDailyCap(userId);
    if (capCheck.capReached) {
      return { success: false, message: "Daily XP cap reached", xpAwarded: 0 };
    }

    // Calculate XP
    let xpDelta = calculateXP(verb, metadata);

    // Apply daily cap
    if (xpDelta > capCheck.remainingXP) {
      xpDelta = capCheck.remainingXP;
    }

    // Record activity
    const activity = await ActivityEvent.create({
      user: userId,
      verb,
      targetType,
      targetId,
      xpDelta,
      metadata,
      idempotencyKey,
    });

    // Update gamification
    let gamification = await Gamification.findOne({ user: userId });
    if (!gamification) {
      gamification = await Gamification.create({ user: userId });
    }

    const oldLevel = gamification.level;
    const result = gamification.addXP(xpDelta, metadata.courseId);

    // Update stats based on activity type
    if (!gamification.stats) {
      gamification.stats = {};
    }

    switch (verb) {
      case "complete_lesson":
        gamification.stats.lessonsCompleted =
          (gamification.stats.lessonsCompleted || 0) + 1;
        break;
      case "complete_course":
        gamification.stats.coursesCompleted =
          (gamification.stats.coursesCompleted || 0) + 1;
        break;
      case "complete_quiz":
        gamification.stats.quizzesCompleted =
          (gamification.stats.quizzesCompleted || 0) + 1;
        if (metadata.isPerfect || metadata.score === 100) {
          gamification.stats.perfectQuizzes =
            (gamification.stats.perfectQuizzes || 0) + 1;
        }
        break;
      case "watch_video":
        gamification.stats.videosWatched =
          (gamification.stats.videosWatched || 0) + 1;
        break;
      case "submit_assignment":
        gamification.stats.assignmentsSubmitted =
          (gamification.stats.assignmentsSubmitted || 0) + 1;
        break;
      case "attend_classroom":
        gamification.stats.classroomsAttended =
          (gamification.stats.classroomsAttended || 0) + 1;
        break;
      case "join_team":
        gamification.stats.teamsJoined =
          (gamification.stats.teamsJoined || 0) + 1;
        break;
      case "earn_certificate":
        gamification.stats.certificatesEarned =
          (gamification.stats.certificatesEarned || 0) + 1;
        break;
    }

    gamification.markModified("stats");
    await gamification.save();

    const newLevel = calculateLevel(gamification.totalXP);
    const leveledUp = newLevel > oldLevel;

    return {
      success: true,
      xpAwarded: xpDelta,
      totalXP: gamification.totalXP,
      level: newLevel,
      leveledUp,
      activity: activity._id,
    };
  } catch (error) {
    console.error("Activity recording error:", error);
    throw error;
  }
};

export const getUserActivities = async (userId, limit = 50) => {
  return await ActivityEvent.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};
