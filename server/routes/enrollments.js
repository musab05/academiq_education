import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getUserEnrollments,
  getTeamEnrollments,
  bulkEnroll,
  getTeamEnrollmentDetails,
  getGlobalReports,
  getCourseEnrollmentDetails,
  getUserEnrollmentDetails,
} from "../controllers/enrollmentController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Global reports - must come before /:id route
router.get("/global-reports", getGlobalReports);

// Get all enrollments with filtering
router.get("/", getEnrollments);

// Get specific enrollment
router.get("/:id", getEnrollmentById);

// Create new enrollment
router.post("/", createEnrollment);

// Update enrollment
router.put("/:id", updateEnrollment);

// Delete enrollment
router.delete("/:id", deleteEnrollment);

// Get user enrollments
router.get("/user/:userId", getUserEnrollments);

// Get team enrollments
router.get("/team/:teamId", getTeamEnrollments);

// Bulk enrollment
router.post("/bulk", bulkEnroll);

// Get team enrollment details for reports
router.get("/team/:teamId/course/:courseSlug/details", getTeamEnrollmentDetails);

// Course and user enrollment details
router.get("/course/:courseId/details", getCourseEnrollmentDetails);
router.get("/user/:userId/details", getUserEnrollmentDetails);

export default router;
