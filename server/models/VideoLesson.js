import mongoose from 'mongoose';

const videoLessonSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      unique: true,
    },
    videoUrl: {
      type: String,
      default: '',
    },
    sourceType: {
      type: String,
      enum: ['link', 'upload'],
      default: 'link',
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    quality: {
      type: String,
      enum: ['360p', '480p', '720p', '1080p'],
      default: '720p',
    },
    subtitles: [
      {
        language: String,
        url: String,
      },
    ],
    chapters: [
      {
        title: String,
        startTime: Number, // in seconds
        endTime: Number,
      },
    ],
    autoplay: {
      type: Boolean,
      default: false,
    },
    allowDownload: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('VideoLesson', videoLessonSchema);