import mongoose from 'mongoose';

const instructorRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: {
    type: Date
  },
  reviewNotes: {
    type: String
  },
  userInfo: {
    firstName: String,
    lastName: String,
    email: String,
    username: String
  }
}, {
  timestamps: true
});

instructorRequestSchema.index({ user: 1, status: 1 });
instructorRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('InstructorRequest', instructorRequestSchema);
