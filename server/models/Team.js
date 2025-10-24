import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['member', 'manager', 'organizer'],
        default: 'member'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trackedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Team', TeamSchema);