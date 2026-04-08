import React, { useState, useEffect, useMemo } from "react";
import { X, User, Users, BookOpen, ChevronDown, Info } from "lucide-react";
import { userAPI, teamAPI, courseAPI } from "../../services/api";
import { useSelector } from "react-redux";

const CreateEnrollmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  enrollmentType = "user", // 'user' or 'team'
  title,
}) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    enrolleeId: "",
    courseId: "",
    notes: "",
  });
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Get selected course for filtering already enrolled users
  const selectedCourse = useMemo(() => {
    return courses.find((c) => c._id === formData.courseId);
  }, [courses, formData.courseId]);

  // Filter courses to only show courses user can manage (context-specific role)
  const manageableCourses = useMemo(() => {
    if (!currentUser) return [];
    // Superadmin can manage all courses
    if (currentUser.role === "superadmin") return courses;
    return courses.filter((course) => {
      // Check if user is the author
      if (
        course.author?._id === currentUser._id ||
        course.author === currentUser._id
      )
        return true;
      // Check if user is the creator
      if (
        course.createdBy?._id === currentUser._id ||
        course.createdBy === currentUser._id
      )
        return true;
      // Check if user is the institute admin
      if (
        course.institute?.admin === currentUser._id ||
        course.institute?.admin?._id === currentUser._id
      )
        return true;
      return false;
    });
  }, [courses, currentUser]);

  // Filter enrollee options to exclude superadmins, current user, and already enrolled users
  const filteredEnrolleeOptions = useMemo(() => {
    if (enrollmentType === "user") {
      return users.filter((user) => {
        // Exclude superadmins
        if (user.role === "superadmin") return false;
        // Exclude current user
        if (user._id === currentUser?._id) return false;
        // Exclude users already enrolled in selected course
        if (selectedCourse?.enrolledUsers?.includes(user._id)) return false;
        return true;
      });
    }
    return teams;
  }, [users, teams, enrollmentType, currentUser, selectedCourse]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setFormData({ enrolleeId: "", courseId: "", notes: "" });
      setErrors({});
    }
  }, [isOpen, enrollmentType]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch courses
      const coursesResponse = await courseAPI.getAllCourses();
      setCourses(coursesResponse.data);

      // Fetch users or teams based on enrollment type
      if (enrollmentType === "user") {
        const usersResponse = await userAPI.getUsers();
        setUsers(usersResponse.data);
      } else {
        const teamsResponse = await teamAPI.getTeams();
        setTeams(teamsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.enrolleeId) {
      newErrors.enrolleeId = `Please select a ${enrollmentType}`;
    }

    if (!formData.courseId) {
      newErrors.courseId = "Please select a course";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const enrollmentData = {
      enrolleeId: formData.enrolleeId,
      courseId: formData.courseId,
      notes: formData.notes,
      enrolleeType: enrollmentType,
    };

    onSubmit(enrollmentData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear enrollee selection when course changes (as filtered list changes)
    if (field === "courseId") {
      setFormData((prev) => ({ ...prev, enrolleeId: "" }));
    }
  };

  if (!isOpen) return null;

  const enrolleeOptions = filteredEnrolleeOptions;
  const enrolleeLabel = enrollmentType === "user" ? "User" : "Team";
  const enrolleeIcon =
    enrollmentType === "user" ? (
      <User className="w-4 h-4" />
    ) : (
      <Users className="w-4 h-4" />
    );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {enrolleeIcon}
            <h3 className="text-lg font-semibold text-gray-900">
              {title || `Enroll ${enrolleeLabel} in Course`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Enrollee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select {enrolleeLabel}
                </label>
                <div className="relative">
                  <select
                    value={formData.enrolleeId}
                    onChange={(e) =>
                      handleInputChange("enrolleeId", e.target.value)
                    }
                    className={`w-full pl-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none ${
                      errors.enrolleeId ? "border-red-300" : "border-gray-200"
                    }`}
                  >
                    <option value="">
                      Choose a {enrolleeLabel.toLowerCase()}...
                    </option>
                    {enrolleeOptions.map((item) => (
                      <option key={item._id} value={item._id}>
                        {enrollmentType === "user"
                          ? `${item.firstName} ${item.lastName} (${item.email})`
                          : `${item.name} (${
                              item.members?.length || 0
                            } members)`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.enrolleeId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.enrolleeId}
                  </p>
                )}
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <div className="relative">
                  <select
                    value={formData.courseId}
                    onChange={(e) =>
                      handleInputChange("courseId", e.target.value)
                    }
                    className={`w-full pl-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none ${
                      errors.courseId ? "border-red-300" : "border-gray-200"
                    }`}
                  >
                    <option value="">Choose a course...</option>
                    {manageableCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title} ({course.level})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.courseId && (
                  <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add any notes about this enrollment..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Info Note */}
              {enrollmentType === "user" && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-orange-800">
                    Users enrolled will be considered as students for this
                    course. Superadmins and already enrolled users are excluded
                    from selection.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Enroll {enrolleeLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEnrollmentModal;
