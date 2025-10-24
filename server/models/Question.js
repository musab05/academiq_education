import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    frontendId: {
      type: String,
      unique: true,
      sparse: true
    },
    type: {
      type: String,
      enum: ['single-select', 'multi-select', 'true-false', 'fill-blank', 'essay'],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: [String], // For single-select, multi-select
    correctAnswers: [String], // Array to support multi-select
    points: {
      type: Number,
      default: 1,
    },
    correctFeedback: String,
    incorrectFeedback: String,
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);