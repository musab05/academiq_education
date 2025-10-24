import mongoose from "mongoose";

// Ensure we delete any existing model to avoid caching issues
if (mongoose.models.AssignmentLesson) {
  delete mongoose.models.AssignmentLesson;
}

const assignmentLessonSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      unique: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    maxPoints: {
      type: Number,
      default: 100,
    },
    allowedFileTypes: [String], // ['pdf', 'doc', 'docx', 'txt']
    maxFileSize: {
      type: Number, // in MB
      default: 10,
    },
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    latePenalty: {
      type: Number, // percentage deduction per day
      default: 10,
    },
    rubric: [
      {
        criteria: String,
        maxPoints: Number,
        description: String,
      },
    ],
    groupAssignment: {
      type: Boolean,
      default: false,
    },
    maxGroupSize: {
      type: Number,
      default: 1,
    },
    attachments: {
      type: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          type: { type: String, required: true },
          size: { type: Number, required: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: true, // Ensure strict schema validation
  }
);

export default mongoose.model("AssignmentLesson", assignmentLessonSchema);
