import mongoose from 'mongoose';

const TeamMessageSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'file'],
      default: 'text',
    },
  },
  { timestamps: true }
);

export default mongoose.model('TeamMessage', TeamMessageSchema);
