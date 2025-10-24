import mongoose from 'mongoose';

const scormLessonSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      unique: true,
    },
    packageUrl: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      enum: ['1.2', '2004'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    launchUrl: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model('ScormLesson', scormLessonSchema);