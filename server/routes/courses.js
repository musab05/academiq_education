import express from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole, checkOwnership, canCreate } from "../middleware/rbac.js";
import {
  getAllCourses,
  getMyCourses,
  getEnrolledCourses,
  createCourse,
  getCourseBySlug,
  updateCourseBySlug,
  deleteCourse,
  addComment,
  deleteComment,
  addReview,
  addFaq,
  answerFaq,
  deleteFaq,
} from "../controllers/courseController.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/courses/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = express.Router();

// Get all courses (for enrollment)
router.get("/all", authenticate, getAllCourses);

// Get user's courses
router.get("/my-courses", authenticate, getMyCourses);

// Get enrolled courses (for students)
router.get("/enrolled", authenticate, getEnrolledCourses);

// Create new course (superadmin, admin, instructor)
router.post("/create", authenticate, canCreate('course'), createCourse);

// Get course by ID
router.get("/:courseId", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const Course = (await import('../models/Course.js')).default;
    const course = await Course.findById(courseId)
      .populate("author", "firstName lastName")
      .populate("categories", "name");
    
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get course by slug
router.get("/slug/:slug", authenticate, getCourseBySlug);

// Comments
router.post("/slug/:slug/comments", authenticate, addComment);
router.delete("/slug/:slug/comments/:commentId", authenticate, deleteComment);

// Reviews
router.post("/slug/:slug/reviews", authenticate, addReview);

// FAQs
router.post("/slug/:slug/faqs", authenticate, addFaq);
router.put("/slug/:slug/faqs/:faqId/answer", authenticate, answerFaq);
router.delete("/slug/:slug/faqs/:faqId", authenticate, deleteFaq);

// Update course by slug (owner, admin, superadmin)
router.put(
  "/slug/:slug",
  authenticate,
  checkOwnership('Course'),
  upload.single("thumbnail"),
  updateCourseBySlug
);

// Delete course by slug (owner, admin, superadmin)
router.delete(
  "/slug/:slug",
  authenticate,
  checkOwnership('Course'),
  deleteCourse
);

export default router;
