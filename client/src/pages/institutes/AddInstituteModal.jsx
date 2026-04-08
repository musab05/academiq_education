import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { instituteAPI, userAPI } from "../../services/api";
import UserSelector from "../../components/department/UserSelector";
import { updateUser } from "../../store/slices/userSlice";

const AddInstituteModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);
  const isSuperAdmin = currentUser?.role === "superadmin";

  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    adminId: isSuperAdmin ? "" : currentUser?._id,
    description: "",
  });
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const fetchAdmins = async () => {
    try {
      const response = await userAPI.getUsers();
      setAdmins(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAdmins([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await instituteAPI.create(formData);
      // Check if the user was promoted to admin
      if (
        response.data?.roleUpgraded ||
        (!isSuperAdmin && currentUser?.role !== "admin")
      ) {
        // Update local user state to reflect new role
        dispatch(updateUser({ role: "admin" }));
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create institute");
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
              Add Institute
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

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Institute Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Vellore Institute of Technology"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Domain *
            </label>
            <input
              type="text"
              required
              value={formData.domain}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  domain: e.target.value.toLowerCase(),
                })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
              placeholder="e.g., vit.edu.in"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the email domain (e.g., for musab.khan@vit.edu.in, enter
              vit.edu.in)
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              {isSuperAdmin ? "Assign Admin *" : "Administrator"}
            </label>
            {isSuperAdmin ? (
              <UserSelector
                users={admins}
                selected={formData.adminId}
                onSelect={(adminId) => setFormData({ ...formData, adminId })}
                placeholder="Select an admin"
              />
            ) : (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>You</strong> will become the admin of this institute.
                  {currentUser?.role === "student" && (
                    <span className="block mt-1 text-xs text-orange-600">
                      Your role will be upgraded to Admin upon creation.
                    </span>
                  )}
                </p>
              </div>
            )}
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
              placeholder="Brief description about the institute"
            />
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
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 tap-target"
            >
              {loading ? "Creating..." : "Create Institute"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddInstituteModal;
