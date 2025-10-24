import mongoose from 'mongoose';

const blockLessonSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      unique: true,
    },
    blocks: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['heading', 'paragraph', 'video', 'image', 'list', 'code', 'quote'],
          required: true,
        },
        content: {
          type: String,
          default: '',
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
  },
  { timestamps: true }
);

export default mongoose.model('BlockLesson', blockLessonSchema);