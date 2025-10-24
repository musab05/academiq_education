import mongoose from 'mongoose';

const ClassroomSessionSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    meetingLink: {
      type: String,
      default: '',
    },
    recordingLink: {
      type: String,
      default: '',
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    resources: [{
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    attendance: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      joinTime: Date,
      leaveTime: Date,
      duration: Number, // in minutes
    }],
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    maxParticipants: {
      type: Number,
      default: 100,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    accessCode: {
      type: String,
      default: '',
    },
    allowedParticipants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ClassroomSession', ClassroomSessionSchema);
