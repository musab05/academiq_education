import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  // Lesson type specific data
  lessonData: {
    // For video lessons
    videoProgress: {
      currentTime: { type: Number, default: 0 },
      duration: { type: Number, default: 0 }
    },
    // For quiz lessons
    quizData: {
      answers: [{ questionId: String, answer: mongoose.Schema.Types.Mixed }],
      score: { type: Number, default: 0 },
      attempts: { type: Number, default: 0 }
    },
    // For text lessons
    textData: {
      scrollPosition: { type: Number, default: 0 },
      readingTime: { type: Number, default: 0 }
    },
    // For assignment lessons
    assignmentData: {
      submissions: [{
        submittedAt: Date,
        files: [String],
        grade: Number,
        feedback: String
      }]
    },
    // For SCORM lessons
    scormData: {
      completionStatus: String,
      scoreRaw: Number,
      sessionTime: String
    }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
progressSchema.index({ user: 1, course: 1, lesson: 1 }, { unique: true });
progressSchema.index({ user: 1, course: 1 });
progressSchema.index({ course: 1, lesson: 1 });

export default mongoose.model('Progress', progressSchema);