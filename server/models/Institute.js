import mongoose from 'mongoose';

const InstituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    branding: {
      primaryColor: { type: String, default: '#f97316' },
      secondaryColor: { type: String, default: '#ef4444' },
      customDomain: { type: String, default: '' },
    },
    limits: {
      maxUsers: { type: Number, default: 1000 },
      maxCourses: { type: Number, default: 100 },
      storageGB: { type: Number, default: 50 },
    },
    settings: {
      autoEnrollByDomain: { type: Boolean, default: true },
      allowCrossCourseSharing: { type: Boolean, default: false },
      customCertificateTemplate: { type: String, default: '' },
    },
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
      status: { type: String, enum: ['active', 'suspended', 'cancelled'], default: 'active' },
      expiresAt: { type: Date },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Institute', InstituteSchema);
