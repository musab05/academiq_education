import mongoose from 'mongoose';

const quizLessonProgressSchema = new mongoose.Schema(
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
    attempts: [{
      attemptNo: Number,
      score: Number,
      answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean
      }],
      startedAt: Date,
      completedAt: Date,
      passed: Boolean
    }],
    currentAttempt: {
      type: Number,
      default: 1
    },
    bestScore: {
      type: Number,
      default: 0
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

quizLessonProgressSchema.index({ user: 1, lesson: 1 });

export default mongoose.model('QuizLessonProgress', quizLessonProgressSchema);
