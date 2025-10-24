import mongoose from 'mongoose';

const textLessonSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      unique: true,
    },
    sections: [
      {
        type: {
          type: String,
          enum: ['heading', 'paragraph', 'list', 'image', 'code'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          default: 0,
        },
        metadata: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    estimatedReadTime: {
      type: Number, // in minutes
      default: 5,
    },
  },
  { timestamps: true }
);

export default mongoose.model('TextLesson', textLessonSchema);