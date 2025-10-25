import mongoose from 'mongoose';

const gamificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalXP: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    icon: String,
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'diamond'],
      default: 'bronze'
    },
    xp: Number,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  courseXP: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    xp: {
      type: Number,
      default: 0
    }
  }],
  achievements: [{
    type: {
      type: String,
      enum: ['lesson_complete', 'course_complete', 'streak', 'quiz_perfect', 'first_course', 'speed_learner', 'assignment_submit', 'video_watch', 'classroom_attend']
    },
    count: {
      type: Number,
      default: 1
    },
    lastEarned: Date
  }],
  stats: {
    lessonsCompleted: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    quizzesCompleted: { type: Number, default: 0 },
    perfectQuizzes: { type: Number, default: 0 },
    assignmentsSubmitted: { type: Number, default: 0 },
    videosWatched: { type: Number, default: 0 },
    classroomsAttended: { type: Number, default: 0 },
    certificatesEarned: { type: Number, default: 0 },
    teamsJoined: { type: Number, default: 0 }
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  }
}, { timestamps: true });

gamificationSchema.methods.addXP = function(amount, courseId = null) {
  this.totalXP += amount;
  
  if (courseId) {
    const courseXP = this.courseXP.find(c => c.course.toString() === courseId.toString());
    if (courseXP) {
      courseXP.xp += amount;
    } else {
      this.courseXP.push({ course: courseId, xp: amount });
    }
  }
  
  // Level up logic: 100 XP per level
  const newLevel = Math.floor(this.totalXP / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    return { leveledUp: true, newLevel };
  }
  
  return { leveledUp: false };
};

gamificationSchema.methods.addBadge = function(badge) {
  const exists = this.badges.find(b => b.badgeId === badge.badgeId);
  if (!exists) {
    this.badges.push(badge);
    return true;
  }
  return false;
};

export default mongoose.model('Gamification', gamificationSchema);
