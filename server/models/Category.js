// models/Category.js
import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // Recursive relation
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

// Generate slug from name
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    // keep slug unique per category name; if collision happens Mongo will throw
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Ensure no two categories with same name under the same parent
categorySchema.index({ name: 1, parent: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
