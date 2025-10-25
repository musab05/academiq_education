import mongoose from 'mongoose';

const adminRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  requestType: {
    type: String,
    enum: ['institute', 'organization'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  instituteName: String,
  instituteType: String,
  instituteDomain: String,
  instituteAddress: String,
  institutePhone: String,
  instituteWebsite: String,
  organizationName: String,
  organizationType: String,
  organizationAddress: String,
  organizationPhone: String,
  organizationWebsite: String,
  requestDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: Date,
  reviewNotes: String,
  userInfo: {
    firstName: String,
    lastName: String,
    email: String,
    username: String
  }
}, {
  timestamps: true
});

adminRequestSchema.index({ user: 1, status: 1 });
adminRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('AdminRequest', adminRequestSchema);
