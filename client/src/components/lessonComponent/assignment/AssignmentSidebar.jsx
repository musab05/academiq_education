import React from "react";
import { Settings, FileText, CheckSquare, Paperclip } from "lucide-react";

const AssignmentSidebar = ({ activeTab, setActiveTab, assignmentData }) => {
  const tabs = [
    { id: "instructions", label: "Instructions", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "rubric", label: "Rubric", icon: CheckSquare },
    { id: "attachments", label: "Attachments", icon: Paperclip },
  ];

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Assignment Editor
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Assignment Summary
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Due Date:</span>{" "}
              {formatDate(assignmentData.dueDate)}
            </div>
            <div>
              <span className="font-medium">Max Points:</span>{" "}
              {assignmentData.maxPoints || 100}
            </div>
            <div>
              <span className="font-medium">File Types:</span>{" "}
              {assignmentData.allowedFileTypes?.length > 0
                ? assignmentData.allowedFileTypes.join(", ").toUpperCase()
                : "Any"}
            </div>
            <div>
              <span className="font-medium">Max File Size:</span>{" "}
              {assignmentData.maxFileSize || 10}MB
            </div>
            {assignmentData.groupAssignment && (
              <div>
                <span className="font-medium">Group Size:</span> Up to{" "}
                {assignmentData.maxGroupSize || 1}
              </div>
            )}
            {assignmentData.rubric && assignmentData.rubric.length > 0 && (
              <div>
                <span className="font-medium">Rubric Criteria:</span>{" "}
                {assignmentData.rubric.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSidebar;
