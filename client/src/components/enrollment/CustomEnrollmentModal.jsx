import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Users,
  Search,
  Plus,
  Check,
  Loader2,
  Mail,
  UserPlus,
} from "lucide-react";
import { useSelector } from "react-redux";
import { enrollmentAPI, userAPI, teamAPI } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const CustomEnrollmentModal = ({
  isOpen,
  onClose,
  enrollmentType = "user", // "user" or "team"
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [enrolling, setEnrolling] = useState(false);

  const { currentCourseId } = useSelector((state) => state.lesson);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen) {
      if (!currentCourseId) {
        showNotification(
          "No course selected. Please select a course first.",
          "warning"
        );
        onClose();
        return;
      }
      fetchAvailableItems();
    }
  }, [isOpen, currentCourseId, enrollmentType]);

  const fetchAvailableItems = async () => {
    try {
      setLoading(true);

      if (enrollmentType === "user") {
        // Get all users
        const usersResponse = await userAPI.getUsers();
        const allUsers = usersResponse.data;

        // Get enrolled users for this course
        const enrollmentsResponse = await enrollmentAPI.getEnrollments({
          courseId: currentCourseId,
          enrolleeType: "user",
        });
        const enrolledUserIds = new Set(
          enrollmentsResponse.data.data.map(
            (enrollment) => enrollment.enrolleeId._id || enrollment.enrolleeId
          )
        );

        // Filter out already enrolled users
        const availableUsers = allUsers.filter(
          (user) => !enrolledUserIds.has(user._id)
        );
        setAvailableUsers(availableUsers);
      } else {
        // Get all teams
        const teamsResponse = await teamAPI.getTeams();
        const allTeams = teamsResponse.data;

        // Get enrolled teams for this course
        const enrollmentsResponse = await enrollmentAPI.getEnrollments({
          courseId: currentCourseId,
          enrolleeType: "team",
        });
        const enrolledTeamIds = new Set(
          enrollmentsResponse.data.data.map(
            (enrollment) => enrollment.enrolleeId._id || enrollment.enrolleeId
          )
        );

        // Filter out already enrolled teams
        const availableTeams = allTeams.filter(
          (team) => !enrolledTeamIds.has(team._id)
        );
        setAvailableTeams(availableTeams);
      }
    } catch (error) {
      console.error("Error fetching available items:", error);
      showNotification("Failed to fetch available items", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredItems = (
    enrollmentType === "user" ? availableUsers : availableTeams
  ).filter((item) => {
    const searchText = searchQuery.toLowerCase();
    if (enrollmentType === "user") {
      return (
        item.firstName?.toLowerCase().includes(searchText) ||
        item.lastName?.toLowerCase().includes(searchText) ||
        item.email?.toLowerCase().includes(searchText) ||
        item.role?.toLowerCase().includes(searchText)
      );
    } else {
      return (
        item.name?.toLowerCase().includes(searchText) ||
        item.description?.toLowerCase().includes(searchText)
      );
    }
  });

  const toggleSelection = (itemId) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleBulkEnroll = async () => {
    if (selectedItems.size === 0) {
      showNotification("Please select at least one item to enroll", "warning");
      return;
    }

    try {
      setEnrolling(true);

      const enrollmentPromises = Array.from(selectedItems).map((itemId) =>
        enrollmentAPI.createEnrollment({
          enrolleeId: itemId,
          courseId: currentCourseId,
          enrolleeType: enrollmentType,
          notes: `Bulk enrollment - ${new Date().toLocaleDateString()}`,
        })
      );

      await Promise.all(enrollmentPromises);

      showNotification(
        `Successfully enrolled ${selectedItems.size} ${enrollmentType}(s)`,
        "success"
      );

      setSelectedItems(new Set());
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error during bulk enrollment:", error);
      showNotification("Failed to enroll selected items", "error");
    } finally {
      setEnrolling(false);
    }
  };

  const selectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item._id)));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Enroll {enrollmentType === "user" ? "Users" : "Teams"}
                </h2>
                <p className="text-gray-600 mt-1">
                  Select {enrollmentType === "user" ? "users" : "teams"} to
                  enroll in this course
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Search and Actions */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={`Search ${
                      enrollmentType === "user" ? "users" : "teams"
                    }...`}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {selectedItems.size === filteredItems.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>

                  <div className="text-sm text-gray-600">
                    {selectedItems.size} selected
                  </div>

                  <button
                    onClick={handleBulkEnroll}
                    disabled={selectedItems.size === 0 || enrolling}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {enrolling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    Enroll Selected
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-96">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <span className="ml-2 text-gray-600">
                    Loading available{" "}
                    {enrollmentType === "user" ? "users" : "teams"}...
                  </span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  {enrollmentType === "user" ? (
                    <User className="w-12 h-12 mb-4" />
                  ) : (
                    <Users className="w-12 h-12 mb-4" />
                  )}
                  <p className="text-lg font-medium">
                    No available {enrollmentType === "user" ? "users" : "teams"}
                  </p>
                  <p className="text-sm">
                    All {enrollmentType === "user" ? "users" : "teams"} are
                    already enrolled or none exist
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedItems.has(item._id)
                          ? "border-orange-500 bg-orange-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleSelection(item._id)}
                    >
                      {/* Selection indicator */}
                      <div className="absolute top-3 right-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedItems.has(item._id)
                              ? "border-orange-500 bg-orange-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedItems.has(item._id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>

                      {enrollmentType === "user" ? (
                        <div className="pr-8">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mb-3">
                            {item.firstName?.[0]?.toUpperCase() ||
                              item.email?.[0]?.toUpperCase() ||
                              "U"}
                          </div>

                          {/* User info */}
                          <div className="space-y-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {item.firstName} {item.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 truncate flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {item.email}
                            </p>
                            <div className="flex items-center justify-between">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  item.role === "admin" ||
                                  item.role === "superadmin"
                                    ? "bg-purple-100 text-purple-800"
                                    : item.role === "instructor"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {item.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="pr-8">
                          {/* Team icon */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mb-3">
                            <Users className="w-6 h-6" />
                          </div>

                          {/* Team info */}
                          <div className="space-y-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{item.members?.length || 0} members</span>
                              <span className="capitalize">
                                {item.type || "team"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {filteredItems.length} available{" "}
                  {enrollmentType === "user" ? "users" : "teams"}
                  {searchQuery &&
                    ` (filtered from ${
                      enrollmentType === "user"
                        ? availableUsers.length
                        : availableTeams.length
                    })`}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkEnroll}
                    disabled={selectedItems.size === 0 || enrolling}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {enrolling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Enroll {selectedItems.size}{" "}
                    {enrollmentType === "user" ? "User" : "Team"}
                    {selectedItems.size !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomEnrollmentModal;
