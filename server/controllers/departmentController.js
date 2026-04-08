import Department from "../models/Department.js";
import User from "../models/User.js";

// Helper to build nested tree
const buildTree = (items, parent = null) => {
  return items
    .filter((it) => String(it.parent) === String(parent))
    .map((it) => ({
      ...it.toObject(),
      children: buildTree(items, it._id),
    }));
};

export const getDepartments = async (req, res) => {
  try {
    const currentUser = req.user;
    let query = { isActive: true };

    // Institute filtering for admins
    if (currentUser.role === "admin" && currentUser.institute) {
      query.institute = currentUser.institute;
    }

    const departments = await Department.find(query)
      .populate("members.user", "firstName lastName email")
      .populate("head", "firstName lastName email")
      .populate("parent", "name code")
      .populate("institute", "name domain")
      .populate("createdBy", "firstName lastName")
      .sort({ name: 1 });

    const tree = buildTree(departments, null);
    res.json({ flat: departments, tree });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, description, code, headId, parent = null } = req.body;
    const currentUser = req.user;

    const parentId = parent === "All" || !parent ? null : parent;

    // Auto-assign institute from current user
    const department = new Department({
      name,
      description,
      code,
      parent: parentId,
      head: headId || null,
      institute: currentUser.institute || null,
      createdBy: currentUser._id,
      members: [
        {
          user: currentUser._id,
          role: "coordinator",
        },
      ],
    });

    await department.save();
    await department.populate("members.user", "firstName lastName email");
    await department.populate("head", "firstName lastName email");
    await department.populate("parent", "name code");
    await department.populate("institute", "name domain");
    await department.populate("createdBy", "firstName lastName");

    res.status(201).json(department);
  } catch (error) {
    console.error("Error creating department:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Department code already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { userId, role = "member" } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    // Check if user already exists in department
    const existingMember = department.members.find(
      (m) => m.user.toString() === userId,
    );
    if (existingMember) {
      return res.status(400).json({ error: "User already in department" });
    }

    department.members.push({ user: userId, role });
    await department.save();
    await department.populate("members.user", "firstName lastName email");

    res.json(department);
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { departmentId, userId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    department.members = department.members.filter(
      (m) => m.user.toString() !== userId,
    );
    await department.save();
    await department.populate("members.user", "firstName lastName email");

    res.json(department);
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { departmentId, userId } = req.params;
    const { role } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const member = department.members.find((m) => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    member.role = role;
    await department.save();
    await department.populate("members.user", "firstName lastName email");

    res.json(department);
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { name, description, code, headId, parent = null } = req.body;

    const parentId = parent === "All" || !parent ? null : parent;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    department.name = name;
    department.description = description;
    department.code = code;
    department.parent = parentId;
    department.head = headId || null;
    await department.save();
    await department.populate("members.user", "firstName lastName email");
    await department.populate("head", "firstName lastName email");
    await department.populate("parent", "name code");
    await department.populate("createdBy", "firstName lastName");

    res.json(department);
  } catch (error) {
    console.error("Error updating department:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Department code already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    // Re-parent children to null (top-level) to avoid orphaned references
    await Department.updateMany(
      { parent: department._id },
      { $set: { parent: null } },
    );

    await Department.findByIdAndDelete(departmentId);
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Server error" });
  }
};
