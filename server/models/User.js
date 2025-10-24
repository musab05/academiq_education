import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const generateAvatarUrl = uuid => {
  return `https://api.dicebear.com/8.x/thumbs/svg?seed=${uuid}`;
};

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin', 'superadmin'],
      default: 'student',
    },
    uuid: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: true, // temporarily true
    },
    isActive: {
      type: Boolean,
      default: true, // temporarily true
    },
    profilePicture: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means self-registered
    },
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
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    language: {
      type: String,
      default: 'en',
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
    },
    expertise: {
      type: [String],
      default: [],
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    if (!this.profilePicture) {
      this.profilePicture = generateAvatarUrl(this.uuid);
    }

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', UserSchema);
export default User;
