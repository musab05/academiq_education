import mongoose from 'mongoose';

const videoLessonProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  progress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Progress',
    required: true
  },
  currentTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  watchedTime: {
    type: Number,
    default: 0
  },
  skippedTime: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

videoLessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export default mongoose.model('VideoLessonProgress', videoLessonProgressSchema);