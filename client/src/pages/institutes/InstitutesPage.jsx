import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Plus,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  Building2,
} from "lucide-react";
import { instituteAPI } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import AddInstituteModal from "./AddInstituteModal";
import EditInstituteModal from "./EditInstituteModal";
import InstituteSettingsModal from "./InstituteSettingsModal";

const InstitutesPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const isSuperAdmin = user?.role === "superadmin";
  const isStudent = user?.role === "student";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState(null);
  const [settingsInstitute, setSettingsInstitute] = useState(null);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      const response = await instituteAPI.getAll();
      setInstitutes(
        Array.isArray(response.data) ? response.data : [response.data],
      );
    } catch (error) {
      console.error("Error fetching institutes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this institute?"))
      return;

    try {
      await instituteAPI.delete(id);
      setInstitutes(institutes.filter((inst) => inst._id !== id));
    } catch (error) {
      console.error("Error deleting institute:", error);
      alert("Failed to delete institute");
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 sm:p-8 mb-6 text-white">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    My Institutes
                  </h1>
                  <p className="text-orange-100 text-sm sm:text-base">
                    Create and manage your educational organizations
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full sm:w-auto px-5 py-3 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Institute
                  {isStudent && (
                    <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">
                      Become Admin
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            {institutes.length > 0 && (
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                <span className="font-medium">
                  {institutes.length} institute
                  {institutes.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {institutes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No institutes yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Create your first institute to start managing your educational
                  organization with courses, users, and departments.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-medium flex items-center gap-2 mx-auto shadow-lg shadow-orange-200"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Institute
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {institutes.map((institute, index) => (
                  <motion.div
                    key={institute._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-lg hover:border-orange-200 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-orange-600" />
                      </div>
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>

                    <h3
                      className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/institutes/${institute._id}/analytics`)
                      }
                    >
                      {institute.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 font-mono">
                      {institute.domain}
                    </p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {institute.description || "No description"}
                    </p>

                    {institute.admin && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                          {institute.admin.firstName?.charAt(0)}
                        </div>
                        <span>
                          {institute.admin.firstName} {institute.admin.lastName}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/institutes/${institute._id}/analytics`)
                        }
                        className="flex-1 px-3 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </button>
                      <button
                        onClick={() => setEditingInstitute(institute)}
                        className="px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(institute._id)}
                        className="px-3 py-2.5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddInstituteModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchInstitutes();
          }}
        />
      )}

      {editingInstitute && (
        <EditInstituteModal
          institute={editingInstitute}
          onClose={() => setEditingInstitute(null)}
          onSuccess={() => {
            setEditingInstitute(null);
            fetchInstitutes();
          }}
        />
      )}

      {settingsInstitute && (
        <InstituteSettingsModal
          institute={settingsInstitute}
          onClose={() => setSettingsInstitute(null)}
          onSuccess={() => {
            setSettingsInstitute(null);
            fetchInstitutes();
          }}
        />
      )}
    </div>
  );
};

export default InstitutesPage;
