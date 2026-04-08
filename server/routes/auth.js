import express from "express";
import {
  signup,
  signin,
  syncInstituteEnrollments,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Signup route
router.post("/signup", signup);

// Signin route
router.post("/signin", signin);

// Get current user
router.get("/me", authenticate, (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
    },
  });
});

// Sync institute enrollments
router.post("/sync-enrollments", authenticate, syncInstituteEnrollments);

export default router;
