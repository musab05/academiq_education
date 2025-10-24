import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
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
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['member', 'coordinator'],
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
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Department', DepartmentSchema);