import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['enrollment', 'assignment', 'grade', 'comment', 'course', 'classroom', 'team', 'achievement', 'system', 'instructor-request'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssignmentLesson' },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
