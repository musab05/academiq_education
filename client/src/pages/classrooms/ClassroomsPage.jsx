import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  Play,
  Edit,
  Trash2,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { classroomManagementAPI } from "../../services/api";
import {
  setCurrentClassroom,
  setCurrentClassroomData,
} from "../../store/slices/classroomSlice";
import CreateClassroomModal from "./CreateClassroomModal";

const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const currentUser = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await classroomManagementAPI.getAll();
      setClassrooms(response.data);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this classroom?")) return;
    try {
      await classroomManagementAPI.delete(id);
      fetchClassrooms();
    } catch (error) {
      console.error("Error deleting classroom:", error);
    }
  };

  const handleOpenClassroom = (classroom) => {
    // Store the classroom data in Redux before navigating
    dispatch(setCurrentClassroom(classroom._id));
    dispatch(setCurrentClassroomData(classroom));
    navigate(`/classroom/${classroom._id}`);
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
                    My Classrooms
                  </h1>
                  <p className="text-orange-100 text-sm sm:text-base">
                    Create and manage your live classrooms
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto px-5 py-3 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Classroom
                  {currentUser?.role === "student" && (
                    <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">
                      Become Instructor
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            {classrooms.length > 0 && (
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                <span className="font-medium">
                  {classrooms.length} classroom
                  {classrooms.length !== 1 ? "s" : ""}
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  {classrooms.reduce(
                    (acc, c) => acc + (c.enrolledStudents?.length || 0),
                    0,
                  )}{" "}
                  total students
                </span>
              </div>
            )}

            {classrooms.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No classrooms yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Create your first live classroom to start teaching and
                  engaging with students in real-time.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-medium flex items-center gap-2 mx-auto shadow-lg shadow-orange-200"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Classroom
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {classrooms.map((classroom, index) => (
                  <motion.div
                    key={classroom._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-lg hover:border-orange-200 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                        <Video className="w-6 h-6 text-orange-600" />
                      </div>
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {classroom.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {classroom.description || "No description"}
                    </p>

                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{classroom.enrolledStudents?.length || 0}</span>
                      </div>
                      {classroom.institute && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                          {classroom.institute.name}
                        </span>
                      )}
                      {classroom.department && (
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium">
                          {classroom.department.name}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenClassroom(classroom)}
                        className="flex-1 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                        Open
                      </button>
                      <button
                        onClick={() => handleDelete(classroom._id)}
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

      {showCreateModal && (
        <CreateClassroomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchClassrooms();
          }}
        />
      )}
    </div>
  );
};

export default ClassroomsPage;
