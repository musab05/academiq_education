import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { classroomManagementAPI, instituteAPI } from "../../services/api";
import CategorySelector from "../../components/common/CategorySelector";
import DepartmentSelector from "../../components/common/DepartmentSelector";
import { updateUser } from "../../store/slices/userSlice";

const CreateClassroomModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);
  const isStudent = currentUser?.role === "student";
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    institute: currentUser?.institute || "",
    department: currentUser?.department || "",
  });
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser?.role === "superadmin") {
      fetchInstitutes();
    }
  }, []);

  const fetchInstitutes = async () => {
    try {
      const response = await instituteAPI.getAll();
      setInstitutes(response.data || []);
    } catch (error) {
      console.error("Error fetching institutes:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = { ...formData };
      if (!payload.category) {
        delete payload.category;
      }
      const response = await classroomManagementAPI.create(payload);
      // Check if the user was promoted to instructor
      if (response.data?.roleUpgraded || isStudent) {
        dispatch(updateUser({ role: "instructor" }));
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create classroom");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              Create Live Classroom
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {isStudent && (
            <div className="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> Creating a classroom will upgrade your
                role to <strong>Instructor</strong>.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Classroom Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Advanced React Development"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe what students will learn in this live classroom"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <CategorySelector
              selected={formData.category}
              onSelect={(categoryId) =>
                setFormData({ ...formData, category: categoryId })
              }
              placeholder="Select a category (optional)"
            />
          </div>

          {currentUser?.role === "superadmin" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Institute
              </label>
              <select
                value={formData.institute}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    institute: e.target.value,
                    department: "",
                  })
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">No Institute</option>
                {institutes.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <DepartmentSelector
              selected={formData.department}
              onSelect={(departmentId) =>
                setFormData({ ...formData, department: departmentId })
              }
              placeholder="Select a department for this classroom"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>Note:</strong> This creates a live-only classroom. After
              creation, you can schedule live sessions for this classroom.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors tap-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 tap-target"
            >
              {loading ? "Creating..." : "Create Classroom"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateClassroomModal;
