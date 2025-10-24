import mongoose from 'mongoose';

const documentLessonSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      unique: true,
    },
    documents: [
      {
        title: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'],
          required: true,
        },
        fileSize: {
          type: Number, // in bytes
          required: true,
        },
        description: String,
        allowDownload: {
          type: Boolean,
          default: true,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    viewerSettings: {
      allowPrint: {
        type: Boolean,
        default: true,
      },
      allowCopy: {
        type: Boolean,
        default: true,
      },
      watermark: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('DocumentLesson', documentLessonSchema);