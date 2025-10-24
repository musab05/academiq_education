import mongoose from 'mongoose';

const ClassroomSchema = new mongoose.Schema(
  {
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
    thumbnail: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    enrolledStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    enrolledTeams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Classroom', ClassroomSchema);
