import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#f97316",
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["member", "manager", "organizer"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trackedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // Team gamification stats
    stats: {
      totalXP: { type: Number, default: 0 },
      lessonsCompleted: { type: Number, default: 0 },
      coursesCompleted: { type: Number, default: 0 },
      quizzesCompleted: { type: Number, default: 0 },
      avgProgress: { type: Number, default: 0 },
      activeDays: { type: Number, default: 0 },
      lastActivity: { type: Date },
    },
    // Team goals
    goals: [
      {
        title: { type: String, required: true },
        description: { type: String },
        targetValue: { type: Number, required: true },
        currentValue: { type: Number, default: 0 },
        type: {
          type: String,
          enum: ["lessons", "courses", "xp", "quizzes", "streak"],
          default: "lessons",
        },
        deadline: { type: Date },
        isCompleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Weekly challenges
    weeklyChallenge: {
      active: { type: Boolean, default: false },
      title: { type: String },
      description: { type: String },
      targetXP: { type: Number, default: 1000 },
      currentXP: { type: Number, default: 0 },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Team", TeamSchema);
