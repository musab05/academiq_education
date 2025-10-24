import mongoose from 'mongoose';

const quizLessonSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      unique: true,
    },
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    }],
    timeLimit: {
      type: Number, // in minutes
      default: null,
    },
    passingScore: {
      type: Number, // percentage
      default: 70,
    },
    allowRetakes: {
      type: Boolean,
      default: true,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
    showResults: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('QuizLesson', quizLessonSchema);