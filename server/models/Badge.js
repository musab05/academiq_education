import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  icon: String,
  category: {
    type: String,
    enum: ['system', 'milestone', 'skill', 'social'],
    default: 'system'
  },
  criteria: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  xpReward: {
    type: Number,
    default: 0
  },
  hidden: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Badge', badgeSchema);
