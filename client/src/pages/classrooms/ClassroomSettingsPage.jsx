import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Settings, Save } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { classroomManagementAPI } from "../../services/api";
import DepartmentSelector from "../../components/common/DepartmentSelector";
import CategorySelector from "../../components/common/CategorySelector";
import { useNotification } from "../../context/NotificationContext";

const ClassroomSettingsPage = () => {
  const { classroomId } = useParams();
  const currentUser = useSelector((state) => state.user.user);
  const { showNotification } = useNotification();
  const [classroom, setClassroom] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maxParticipants: 100,
    isPrivate: false,
    autoEnrollInstituteStudents: false,
    category: "",
    department: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if current user can manage this classroom (context-specific role)
  const canManageClassroom = () => {
    if (!currentUser || !classroom) return false;
    // Superadmin can manage any classroom
    if (currentUser.role === "superadmin") return true;
    // Check if user is the instructor of this classroom
    if (
      classroom.instructor?._id === currentUser._id ||
      classroom.instructor === currentUser._id
    )
      return true;
    // Check if user is the creator of this classroom
    if (
      classroom.createdBy?._id === currentUser._id ||
      classroom.createdBy === currentUser._id
    )
      return true;
    // Check if user is the institute admin (if classroom belongs to an institute)
    if (
      classroom.institute?.admin === currentUser._id ||
      classroom.institute?.admin?._id === currentUser._id
    )
      return true;
    return false;
  };

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  const fetchClassroom = async () => {
    try {
      const response = await classroomManagementAPI.getAll();
      const found = response.data.find((c) => c._id === classroomId);
      setClassroom(found);
      setFormData({
        title: found.title,
        description: found.description || "",
        maxParticipants: found.maxParticipants || 100,
        isPrivate: found.isPrivate || false,
        autoEnrollInstituteStudents: found.autoEnrollInstituteStudents || false,
        category: found.category?._id || found.category || "",
        department: found.department?._id || found.department || "",
      });
    } catch (error) {
      console.error("Error fetching classroom:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await classroomManagementAPI.update(classroomId, formData);
      showNotification({
        type: "success",
        message: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      showNotification({ type: "error", message: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          onMenuClick={() => {
            setSidebarCollapsed(!sidebarCollapsed);
            setSidebarOpen(!sidebarOpen);
          }}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Classroom Settings
              </h1>
              {canManageClassroom() && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="tap-target w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Classroom Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  disabled={!canManageClassroom()}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
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
                  disabled={!canManageClassroom()}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
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
                  disabled={!canManageClassroom()}
                  placeholder="Select a category for this classroom"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <DepartmentSelector
                  selected={formData.department}
                  onSelect={(departmentId) =>
                    setFormData({ ...formData, department: departmentId })
                  }
                  disabled={!canManageClassroom()}
                  placeholder="Select a department for this classroom"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Max Participants per Session
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="500"
                  disabled={!canManageClassroom()}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
                />
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrivate: e.target.checked })
                  }
                  disabled={!canManageClassroom()}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 disabled:cursor-not-allowed mt-0.5"
                />
                <label
                  htmlFor="isPrivate"
                  className="text-xs sm:text-sm font-medium text-gray-700"
                >
                  Make classroom private (requires access code for sessions)
                </label>
              </div>

              {classroom?.institute && (
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <input
                    type="checkbox"
                    id="autoEnroll"
                    checked={formData.autoEnrollInstituteStudents}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        autoEnrollInstituteStudents: e.target.checked,
                      })
                    }
                    disabled={!canManageClassroom()}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 disabled:cursor-not-allowed mt-0.5"
                  />
                  <label
                    htmlFor="autoEnroll"
                    className="text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Auto-enroll all students from institute domain
                  </label>
                </div>
              )}
            </div>

            {canManageClassroom() && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mt-4 sm:mt-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Danger Zone
                </h2>
                <div className="border border-red-200 rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-red-600 mb-2 text-sm sm:text-base">
                    Delete Classroom
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    Once you delete a classroom, there is no going back. All
                    sessions and data will be permanently deleted.
                  </p>
                  <button className="tap-target w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm sm:text-base">
                    Delete Classroom
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomSettingsPage;
