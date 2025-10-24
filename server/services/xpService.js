// XP Rules Configuration
const XP_RULES = {
  COMPLETE_LESSON: 50,
  COMPLETE_QUIZ_BASE: 20,
  COMPLETE_QUIZ_ACCURACY_MAX: 30,
  COMPLETE_COURSE: 200,
  DAILY_STREAK_BONUS: 10,
  TEAM_COLLABORATION: 15,
  PERFECT_QUIZ_BONUS: 50,
  DAILY_CAP: 500
};

const LEVELING_EXPONENT = 1.4;

export const calculateXP = (action, metadata = {}) => {
  let xp = 0;
  
  switch (action) {
    case 'complete_lesson':
      xp = XP_RULES.COMPLETE_LESSON;
      break;
      
    case 'complete_quiz':
      xp = XP_RULES.COMPLETE_QUIZ_BASE;
      if (metadata.accuracy !== undefined) {
        const accuracyBonus = Math.floor((metadata.accuracy / 100) * XP_RULES.COMPLETE_QUIZ_ACCURACY_MAX);
        xp += accuracyBonus;
      }
      if (metadata.accuracy === 100) {
        xp += XP_RULES.PERFECT_QUIZ_BONUS;
      }
      break;
      
    case 'complete_course':
      xp = XP_RULES.COMPLETE_COURSE;
      break;
      
    case 'daily_streak':
      xp = XP_RULES.DAILY_STREAK_BONUS * (metadata.streakDays || 1);
      break;
      
    case 'team_collaboration':
      xp = XP_RULES.TEAM_COLLABORATION;
      break;
      
    default:
      xp = 0;
  }
  
  return xp;
};

export const calculateLevel = (totalXP) => {
  return Math.floor(Math.pow(totalXP, 1 / LEVELING_EXPONENT));
};

export const getXPForNextLevel = (currentLevel) => {
  return Math.floor(Math.pow(currentLevel + 1, LEVELING_EXPONENT));
};

export const checkDailyCap = async (userId, date = new Date()) => {
  const ActivityEvent = (await import('../models/ActivityEvent.js')).default;
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const todayEvents = await ActivityEvent.find({
    user: userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const totalXPToday = todayEvents.reduce((sum, event) => sum + event.xpDelta, 0);
  
  return {
    totalXPToday,
    remainingXP: Math.max(0, XP_RULES.DAILY_CAP - totalXPToday),
    capReached: totalXPToday >= XP_RULES.DAILY_CAP
  };
};
