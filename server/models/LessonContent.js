import mongoose from 'mongoose';

const lessonContentSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseTitle: String,
  courseDescription: String,
  processedText: {
    type: String,
    required: true
  },
  lessonType: {
    type: String,
    enum: ['text', 'video', 'block'],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

lessonContentSchema.index({ lesson: 1 });
lessonContentSchema.index({ course: 1 });

export default mongoose.model('LessonContent', lessonContentSchema);
