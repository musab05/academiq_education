import Category from "../models/Category.js";
import Course from "../models/Course.js";

// Helper to build nested tree
const buildTree = (items, parent = null) => {
  return items
    .filter((it) => String(it.parent) === String(parent))
    .map((it) => ({
      ...it.toObject(),
      children: buildTree(items, it._id),
    }));
};

export const listCategories = async (req, res) => {
  try {
    // populate parent so frontend can display parent name easily
    const categories = await Category.find({})
      .sort({ name: 1 })
      .populate("parent", "name")
      .populate("createdBy", "firstName lastName role");
    // return flat and tree
    const tree = buildTree(categories, null);
    res.json({ flat: categories, tree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, parent = null } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Normalize parent: if 'All' or empty -> null
    const parentId = parent === "All" || !parent ? null : parent;

    const category = new Category({ 
      name: name.trim(), 
      parent: parentId,
      createdBy: req.user._id 
    });
    await category.save();
    await category.populate("parent", "name");

    res.status(201).json(category);
  } catch (error) {
    console.error("Create Category Error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Category name must be unique under the same parent" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent = null } = req.body;

    const parentId = parent === "All" || !parent ? null : parent;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    category.name = name?.trim() ?? category.name;
    category.parent = parentId;

    await category.save();
    await category.populate("parent", "name");
    res.json(category);
  } catch (error) {
    console.error("Update Category Error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Category name must be unique under the same parent" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    // Remove category reference from courses
    await Course.updateMany(
      { categories: category._id },
      { $pull: { categories: category._id } }
    );

    // Re-parent children to null (top-level) to avoid orphaned references
    await Category.updateMany(
      { parent: category._id },
      { $set: { parent: null } }
    );

    await category.remove();

    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
