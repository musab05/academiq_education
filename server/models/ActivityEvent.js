import mongoose from 'mongoose';

const activityEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  verb: {
    type: String,
    required: true,
    enum: ['complete_lesson', 'complete_quiz', 'complete_course', 'join_team', 'daily_login']
  },
  targetType: {
    type: String,
    enum: ['lesson', 'quiz', 'course', 'team']
  },
  targetId: mongoose.Schema.Types.ObjectId,
  xpDelta: {
    type: Number,
    default: 0
  },
  metadata: mongoose.Schema.Types.Mixed,
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

activityEventSchema.index({ user: 1, createdAt: -1 });
activityEventSchema.index({ idempotencyKey: 1 });

export default mongoose.model('ActivityEvent', activityEventSchema);
