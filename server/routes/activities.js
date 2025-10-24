import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getActivity } from "../controllers/activitiesController.js";

const router = express.Router();

// Get activity for a lesson
router.get("/lesson/:lessonId", authenticate, getActivity);

// Note: Update operations should use specific lesson type routes
// e.g., /api/text-lessons/:lessonId, /api/video-lessons/:lessonId, etc.

export default router;
