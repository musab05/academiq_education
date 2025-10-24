import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  uploadVideo,
  uploadScorm,
  uploadAssignmentFile,
  uploadResourceFile,
  uploadDocument,
} from "../controllers/uploadController.js";

const router = express.Router();

// Upload video endpoint
router.post("/video", authenticate, uploadVideo);

// Upload SCORM endpoint
router.post("/scorm", authenticate, uploadScorm);

// Upload assignment file endpoint
router.post("/assignment", authenticate, uploadAssignmentFile);

// Upload resource file endpoint
router.post("/resource", authenticate, uploadResourceFile);

// Upload document endpoint
router.post("/document", authenticate, uploadDocument);

export default router;
