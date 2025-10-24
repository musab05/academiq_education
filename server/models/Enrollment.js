import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema(
  {
    // Who is enrolled
    enrolleeType: {
      type: String,
      enum: ["user", "team"],
      required: true,
    },
    enrolleeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "enrolleeModel",
    },
    enrolleeModel: {
      type: String,
      required: true,
      enum: ["User", "Team"],
    },

    // What course they're enrolled in
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Who enrolled them
    enrolledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // How they were enrolled
    enrollmentSource: {
      type: String,
      enum: ["self", "admin", "instructor", "manager"],
      required: true,
    },

    // Enrollment status
    status: {
      type: String,
      enum: ["active", "completed", "suspended", "dropped"],
      default: "active",
    },

    // Progress tracking
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Timestamps
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
    },

    // Additional metadata
    notes: {
      type: String,
      default: "",
    },

    // For team enrollments - track individual members
    teamMemberProgress: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        status: {
          type: String,
          enum: ["active", "completed", "dropped"],
          default: "active",
        },
        lastAccessedAt: {
          type: Date,
        },
        completedAt: {
          type: Date,
        },
      },
    ],

    // Soft delete
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
EnrollmentSchema.index({ enrolleeType: 1, enrolleeId: 1 });
EnrollmentSchema.index({ course: 1 });
EnrollmentSchema.index({ enrolledBy: 1 });
EnrollmentSchema.index({ status: 1 });
EnrollmentSchema.index({ enrolledAt: -1 });

// Ensure unique enrollment per course per enrollee
EnrollmentSchema.index(
  { enrolleeType: 1, enrolleeId: 1, course: 1 },
  { unique: true }
);

// Virtual for calculating team average progress
EnrollmentSchema.virtual("teamAverageProgress").get(function () {
  if (this.enrolleeType !== "team" || !this.teamMemberProgress.length) {
    return this.progress;
  }

  const activeMembers = this.teamMemberProgress.filter(
    (member) => member.status === "active"
  );
  if (activeMembers.length === 0) return 0;

  const totalProgress = activeMembers.reduce(
    (sum, member) => sum + member.progress,
    0
  );
  return Math.round(totalProgress / activeMembers.length);
});

// Pre-save middleware to update progress for team enrollments
EnrollmentSchema.pre("save", function (next) {
  if (this.enrolleeType === "team" && this.teamMemberProgress.length > 0) {
    this.progress = this.teamAverageProgress;
  }
  next();
});

export default mongoose.model("Enrollment", EnrollmentSchema);
