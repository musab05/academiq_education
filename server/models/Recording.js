import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassroomSession'
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['classroom', 'team'],
    default: 'classroom'
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Recording', recordingSchema);
