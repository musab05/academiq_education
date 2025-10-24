import mongoose from "mongoose";

const textLessonProgressSchema = new mongoose.Schema(
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
    scrollPosition: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number,
      default: 0,
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
  }
);

textLessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export default mongoose.model("TextLessonProgress", textLessonProgressSchema);
