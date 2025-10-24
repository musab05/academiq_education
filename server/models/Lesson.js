import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'video', 'blocks', 'scorm', 'quiz', 'assignment', 'document', 'codeblock'],
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      default: '',
    },
    attachments: [{
      fileName: String,
      filePath: String,
      fileSize: Number,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export default mongoose.model('Lesson', lessonSchema);