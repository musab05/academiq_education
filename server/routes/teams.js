import express from "express";
import {
  getTeams,
  createTeam,
  updateTeam,
  addMember,
  removeMember,
  updateMemberRole,
  deleteTeam,
  updateTrackedCourses,
  getTeamStats,
  getTeamsLeaderboard,
  addTeamGoal,
  updateTeamGoal,
  deleteTeamGoal,
  updateTeamSettings,
} from "../controllers/teamController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getTeams);
router.get("/leaderboard", authenticate, getTeamsLeaderboard);
router.get("/:teamId/stats", authenticate, getTeamStats);
router.post("/", authenticate, createTeam);
router.put("/:teamId", authenticate, updateTeam);
router.put("/:teamId/settings", authenticate, updateTeamSettings);
router.post("/:teamId/members", authenticate, addMember);
router.delete("/:teamId/members/:userId", authenticate, removeMember);
router.put("/:teamId/members/:userId/role", authenticate, updateMemberRole);
router.put("/:teamId/tracked-courses", authenticate, updateTrackedCourses);
router.post("/:teamId/goals", authenticate, addTeamGoal);
router.put("/:teamId/goals/:goalId", authenticate, updateTeamGoal);
router.delete("/:teamId/goals/:goalId", authenticate, deleteTeamGoal);
router.delete("/:teamId", authenticate, deleteTeam);

export default router;
