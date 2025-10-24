import mongoose from 'mongoose';

const assignmentLessonProgressSchema = new mongoose.Schema(
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
    submittedFile: String,
    submittedAt: Date,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    marks: Number,
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date
  },
  { timestamps: true }
);

assignmentLessonProgressSchema.index({ user: 1, lesson: 1 });

export default mongoose.model('AssignmentLessonProgress', assignmentLessonProgressSchema);
