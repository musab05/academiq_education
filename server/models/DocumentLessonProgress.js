import mongoose from 'mongoose';

const documentLessonProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    progress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Progress',
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    lastAccessTime: Date
  },
  { timestamps: true }
);

documentLessonProgressSchema.index({ user: 1, lesson: 1 });

export default mongoose.model('DocumentLessonProgress', documentLessonProgressSchema);
