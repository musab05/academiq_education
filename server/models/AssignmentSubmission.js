import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: String,
  fileSize: Number,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted'
  },
  marks: Number,
  maxMarks: Number,
  feedback: String,
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: Date
}, {
  timestamps: true
});

export default mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
