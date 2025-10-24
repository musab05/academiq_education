import express from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole, checkOwnership, canCreate } from "../middleware/rbac.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Public list
router.get("/", listCategories);

// Create category (superadmin, admin only)
router.post("/create", authenticate, canCreate('category'), createCategory);

// Update category (owner, admin, superadmin)
router.put("/:id", authenticate, checkOwnership('Category'), updateCategory);

// Delete category (owner, admin, superadmin)
router.delete("/:id", authenticate, checkOwnership('Category'), deleteCategory);

export default router;
