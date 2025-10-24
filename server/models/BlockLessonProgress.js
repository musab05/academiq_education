import mongoose from "mongoose";

const blockLessonProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    progress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Progress",
      required: true,
    },
    scrollProgress: {
      type: Number,
      default: 0,
    },
    completedBlocks: [{
      type: String,
      required: true
    }],
    totalBlocks: {
      type: Number,
      default: 0,
    },
    videoProgress: {
      watchedTime: {
        type: Number,
        default: 0,
      },
      skippedTime: {
        type: Number,
        default: 0,
      },
      totalDuration: {
        type: Number,
        default: 0,
      }
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    strict: false // Allow removal of old fields
  }
);

blockLessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export default mongoose.model("BlockLessonProgress", blockLessonProgressSchema);