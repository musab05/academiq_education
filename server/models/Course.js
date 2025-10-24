// models/Course.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    description: {
      type: String,
      default: '',
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    thumbnail: {
      type: String,
      default: 'http://localhost:3000/uploads/thumbnail.jpg',
    },
    price: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    language: {
      type: String,
      default: 'English',
    },
    published: {
      type: Boolean,
      default: false,
    },
    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    certificateEnabled: {
      type: Boolean,
      default: false,
    },
    certificateTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CertificateTemplate',
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    enrollmentType: {
      type: String,
      enum: ['open', 'approval', 'invite'],
      default: 'open',
    },
    maxStudents: {
      type: Number,
      default: null,
    },
    completionCriteria: {
      type: String,
      enum: ['all_lessons', 'percentage', 'manual'],
      default: 'all_lessons',
    },
    completionPercentage: {
      type: Number,
      default: 100,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    gradingSystem: {
      type: String,
      enum: ['percentage', 'points', 'pass_fail'],
      default: 'percentage',
    },
    passingGrade: {
      type: Number,
      default: 70,
    },
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }],
    reviews: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }],
    faqs: [{
      question: String,
      answer: String,
      askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Automatically generate slug from title
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

export default mongoose.model('Course', courseSchema);
