import express from "express";
import {
  getInstitutes,
  createInstitute,
  updateInstitute,
  deleteInstitute,
} from "../controllers/instituteController.js";
import {
  getInstituteAnalytics,
  getAllInstitutesAnalytics,
  updateInstituteBranding,
  updateInstituteSettings,
  updateInstituteLimits,
  updateSubscription,
} from "../controllers/instituteAnalyticsController.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole, canCreate } from "../middleware/rbac.js";

const router = express.Router();

router.get(
  "/my-institute",
  authenticate,
  requireRole("admin"),
  async (req, res) => {
    try {
      const Institute = (await import("../models/Institute.js")).default;
      const institute = await Institute.findOne({ admin: req.user.id });
      if (!institute) {
        return res.status(404).json({ message: "Institute not found" });
      }
      res.json(institute);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/",
  authenticate,
  requireRole("superadmin", "admin"),
  async (req, res) => {
    try {
      const Institute = (await import("../models/Institute.js")).default;
      if (req.user.role === "admin") {
        const institute = await Institute.findOne({
          admin: req.user.id,
        }).populate("admin", "firstName lastName email");
        return res.json(institute);
      }
      return getInstitutes(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Allow any authenticated user to create institute (auto-promotes to admin)
router.post("/", authenticate, canCreate("institute"), createInstitute);
router.put(
  "/:id",
  authenticate,
  requireRole("superadmin", "admin"),
  updateInstitute,
);
router.delete("/:id", authenticate, requireRole("superadmin"), deleteInstitute);

// Analytics
router.get(
  "/analytics/all",
  authenticate,
  requireRole("superadmin"),
  getAllInstitutesAnalytics,
);
router.get(
  "/:id/analytics",
  authenticate,
  requireRole("superadmin", "admin"),
  getInstituteAnalytics,
);

// Settings
router.put(
  "/:id/branding",
  authenticate,
  requireRole("superadmin"),
  updateInstituteBranding,
);
router.put(
  "/:id/settings",
  authenticate,
  requireRole("superadmin"),
  updateInstituteSettings,
);
router.put(
  "/:id/limits",
  authenticate,
  requireRole("superadmin"),
  updateInstituteLimits,
);
router.put(
  "/:id/subscription",
  authenticate,
  requireRole("superadmin"),
  updateSubscription,
);

export default router;
