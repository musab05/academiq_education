import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import { lessonAPI } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import AssignmentSidebar from "./assignment/AssignmentSidebar";
import AssignmentInstructions from "./assignment/AssignmentInstructions";
import AssignmentSettings from "./assignment/AssignmentSettings";
import AssignmentRubric from "./assignment/AssignmentRubric";
import ResourceUpload from "./assignment/ResourceUpload";
import LessonSettingsModal from "./LessonSettingsModal";

const AssignmentLessonEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [lessonTitle, setLessonTitle] = useState("");
  const [assignmentData, setAssignmentData] = useState({
    instructions: "",
    dueDate: null,
    maxPoints: 100,
    allowedFileTypes: ["pdf", "doc", "docx"],
    maxFileSize: 10,
    allowLateSubmission: false,
    latePenalty: 10,
    rubric: [],
    groupAssignment: false,
    maxGroupSize: 1,
    attachments: [],
  });
  const [savedData, setSavedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("instructions");
  const [showSettings, setShowSettings] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (
        assignmentData.instructions ||
        assignmentData.dueDate ||
        assignmentData.attachments?.length > 0
      ) {
        saveDraft();
      }
    }, 2000);
  }, [assignmentData]);

  const fetchLesson = async () => {
    try {
      const response = await lessonAPI.getAssignmentActivity(lessonId);
      setLessonTitle(response.data.lesson.title);
      const activity = response.data.activity || {};

      setAssignmentData({
        instructions: activity.instructions || "",
        dueDate: activity.dueDate || null,
        maxPoints: activity.maxPoints || 100,
        allowedFileTypes: activity.allowedFileTypes || ["pdf", "doc", "docx"],
        maxFileSize: activity.maxFileSize || 10,
        allowLateSubmission: activity.allowLateSubmission || false,
        latePenalty: activity.latePenalty || 10,
        rubric: activity.rubric || [],
        groupAssignment: activity.groupAssignment || false,
        maxGroupSize: activity.maxGroupSize || 1,
        attachments: (activity.attachments || []).map((attachment) => ({
          ...attachment,
          id: attachment.id || `${Date.now()}-${Math.random()}`, // Ensure each attachment has a unique ID
        })),
      });
      setSavedData(activity);
      setAttachments(response.data.lesson.attachments || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      showNotification({
        type: 'error',
        message: 'Failed to load lesson data'
      });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validation
      if (!assignmentData.instructions.trim()) {
        showNotification({
          type: 'error',
          message: 'Assignment instructions are required'
        });
        return;
      }
      if (!assignmentData.dueDate) {
        showNotification({
          type: 'error',
          message: 'Due date is required'
        });
        return;
      }
      if (new Date(assignmentData.dueDate) <= new Date()) {
        showNotification({
          type: 'error',
          message: 'Due date must be in the future'
        });
        return;
      }

      await lessonAPI.updateAssignmentActivity(lessonId, {
        ...assignmentData,
        isDraft: false,
      });
      setSavedData({ ...assignmentData });
      showNotification({
        type: 'success',
        message: 'Assignment published successfully!'
      });
    } catch (error) {
      console.error("Error publishing assignment:", error);
      const errorMessage =
        error.response?.data?.error || "Error publishing assignment";
      showNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setAssignmentData({ ...savedData });
  };

  const handleTitleChange = async (newTitle) => {
    setLessonTitle(newTitle);
    try {
      await lessonAPI.updateLesson(lessonId, { title: newTitle });
    } catch (error) {
      console.error("Error updating title:", error);
      showNotification({
        type: 'error',
        message: 'Failed to update lesson title'
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const saveDraft = async () => {
    try {
      console.log("Saving draft with data:", assignmentData);
      await lessonAPI.updateAssignmentActivity(lessonId, {
        ...assignmentData,
        isDraft: true,
      });
      console.log("Draft saved successfully");
    } catch (error) {
      console.error("Error saving draft:", error);
      showNotification({
        type: 'error',
        message: 'Failed to auto-save draft'
      });
    }
  };

  const updateAssignmentData = (updates) => {
    setAssignmentData((prev) => ({ ...prev, ...updates }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "instructions":
        return (
          <AssignmentInstructions
            instructions={assignmentData.instructions}
            onUpdate={updateAssignmentData}
          />
        );
      case "settings":
        return (
          <AssignmentSettings
            settings={assignmentData}
            onUpdate={updateAssignmentData}
          />
        );
      case "rubric":
        return (
          <AssignmentRubric
            rubric={assignmentData.rubric}
            onUpdate={updateAssignmentData}
          />
        );
      case "attachments":
        return (
          <ResourceUpload
            attachments={assignmentData.attachments}
            onUpdate={updateAssignmentData}
            lessonId={lessonId}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        mode="lesson-edit"
        lessonTitle={lessonTitle}
        onLessonTitleChange={handleTitleChange}
        onSave={handleSave}
        saving={saving}
        onRevert={handleRevert}
        onBack={handleBack}
        onSettingsClick={() => setShowSettings(true)}
      />

      <LessonSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        lessonId={lessonId}
        attachments={attachments}
        onAttachmentsUpdate={setAttachments}
      />

      <div className="flex-1 flex overflow-hidden bg-gray-50">
        <AssignmentSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          assignmentData={assignmentData}
        />

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentLessonEditor;
