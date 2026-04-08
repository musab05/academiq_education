import express from "express";
import { authenticate } from "../middleware/auth.js";
import { canCreate } from "../middleware/rbac.js";
import {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  joinSession,
  leaveSession,
  uploadResource,
  getSessionAnalytics,
  removeParticipant,
} from "../controllers/classroomController.js";

const router = express.Router();

router.get("/", authenticate, getSessions);
// Allow any authenticated user to create sessions (auto-promotes to instructor)
router.post("/", authenticate, canCreate("classroom"), createSession);
router.get("/:sessionId", authenticate, getSessionById);
router.put("/:sessionId", authenticate, updateSession);
router.delete("/:sessionId", authenticate, deleteSession);
router.post("/:sessionId/join", authenticate, joinSession);
router.post("/:sessionId/leave", authenticate, leaveSession);
router.post("/:sessionId/resources", authenticate, uploadResource);
router.get("/:sessionId/analytics", authenticate, getSessionAnalytics);
router.delete(
  "/:sessionId/participants/:userId",
  authenticate,
  removeParticipant,
);

export default router;
