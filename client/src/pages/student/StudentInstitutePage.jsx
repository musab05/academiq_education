import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Building2,
  Users,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Plus,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { instituteAPI } from "../../services/api";
import { updateUser } from "../../store/slices/userSlice";
import AddInstituteModal from "../institutes/AddInstituteModal";

const StudentInstitutePage = () => {
  const dispatch = useDispatch();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (user?.institute) {
      fetchInstitute();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchInstitute = async () => {
    try {
      if (user.role === "admin") {
        const response = await instituteAPI.getAll();
        const institutes = response.data || [];
        const myInstitute = institutes.find(
          (inst) => inst.admin === user._id || inst._id === user.institute,
        );
        setInstitute(myInstitute);
      } else {
        const response = await instituteAPI.getAll();
        const institutes = response.data || [];
        const myInstitute = institutes.find(
          (inst) => inst._id === user.institute,
        );
        setInstitute(myInstitute);
      }
    } catch (error) {
      console.error("Error fetching institute:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => {
            setSidebarCollapsed(!sidebarCollapsed);
            setSidebarOpen(!sidebarOpen);
          }}
        />
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                My Institute
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Information about your educational institution
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : !institute ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No Institute Yet
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                  You are not associated with any institute. Create your own
                  organization to manage courses, users, and teams.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-medium shadow-lg shadow-orange-200"
                >
                  <Plus className="w-5 h-5" />
                  Create Your Institute
                </button>
                <p className="text-xs text-gray-400 mt-4">
                  Creating an institute will upgrade your role to Admin
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6 md:p-8 text-white">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-lg sm:rounded-xl flex items-center justify-center text-orange-500 font-bold text-2xl sm:text-3xl mr-3 sm:mr-4 flex-shrink-0">
                      {institute.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                        {institute.name}
                      </h2>
                      {institute.domain && (
                        <p className="text-orange-100 mt-1 text-sm sm:text-base truncate">
                          {institute.domain}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="flex items-start">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Email
                        </p>
                        <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                          {institute.contactEmail || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Phone
                        </p>
                        <p className="text-sm sm:text-base text-gray-900 font-medium">
                          {institute.contactPhone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start sm:col-span-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Address
                        </p>
                        <p className="text-sm sm:text-base text-gray-900 font-medium">
                          {institute.address || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {institute.description && (
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                        About
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {institute.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-blue-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-blue-900">
                        {institute.stats?.totalUsers || 0}
                      </p>
                      <p className="text-xs sm:text-sm text-blue-600">
                        Total Users
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-purple-900">
                        {institute.stats?.totalCourses || 0}
                      </p>
                      <p className="text-xs sm:text-sm text-purple-600">
                        Total Courses
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-orange-900">
                        {institute.stats?.totalDepartments || 0}
                      </p>
                      <p className="text-xs sm:text-sm text-orange-600">
                        Departments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Institute Modal */}
      {showCreateModal && (
        <AddInstituteModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refresh and update user role
            dispatch(updateUser({ role: "admin" }));
            fetchInstitute();
          }}
        />
      )}
    </div>
  );
};

export default StudentInstitutePage;
