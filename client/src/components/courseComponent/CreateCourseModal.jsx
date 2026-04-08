import React from "react";

const CreateCourseModal = ({
  isOpen,
  onClose,
  courseTitle,
  setCourseTitle,
  courseDescription,
  setCourseDescription,
  onCreateCourse,
  loading,
  isStudent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-4">Create New Course</h2>

        {isStudent && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> Creating a course will upgrade your role to{" "}
              <strong>Instructor</strong>.
            </p>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Course Title
        </label>
        <input
          type="text"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
          placeholder="Enter course title"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={courseDescription}
          onChange={(e) => setCourseDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
          placeholder="Enter course description (optional)"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onCreateCourse}
            className="px-4 py-2 bg-[#FF5A00] text-white rounded hover:bg-[#ff8f52] disabled:opacity-50"
            disabled={loading || !courseTitle.trim()}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseModal;
