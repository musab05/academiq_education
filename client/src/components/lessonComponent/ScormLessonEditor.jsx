import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import { lessonAPI } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import ScormUpload from "./scorm/ScormUpload";
import ScormPreview from "./scorm/ScormPreview";
import LessonSettingsModal from "./LessonSettingsModal";

const ScormLessonEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [lessonTitle, setLessonTitle] = useState("");
  const [scormData, setScormData] = useState({
    packageUrl: "",
    version: "",
    title: "",
    description: "",
    launchUrl: "",
  });
  const [savedScormData, setSavedScormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    console.log("ScormLessonEditor mounted, lessonId:", lessonId);
    console.log(
      "API base URL:",
      import.meta.env.VITE_API_URL || "http://localhost:3000"
    );
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await lessonAPI.getScormActivity(lessonId);
      setLessonTitle(response.data.lesson.title);
      const activity = response.data.activity || {};
      setScormData({
        packageUrl: activity.packageUrl || "",
        version: activity.version || "",
        title: activity.title || "",
        description: activity.description || "",
        launchUrl: activity.launchUrl || "",
      });
      setSavedScormData(activity);
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
      await lessonAPI.updateScormActivity(lessonId, {
        ...scormData,
        isDraft: false,
      });
      setSavedScormData(scormData);
      showNotification({
        type: 'success',
        message: 'SCORM lesson saved successfully!'
      });
    } catch (error) {
      console.error("Error saving lesson:", error);
      showNotification({
        type: 'error',
        message: 'Failed to save lesson. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setScormData({
      packageUrl: savedScormData.packageUrl || "",
      version: savedScormData.version || "",
      title: savedScormData.title || "",
      description: savedScormData.description || "",
      launchUrl: savedScormData.launchUrl || "",
    });
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

  const handleFileUpload = async (file) => {
    console.log("=== SCORM UPLOAD START (Frontend) ===");
    console.log("File selected:", file?.name, file?.size, file?.type);

    if (!file) {
      console.log("No file provided");
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".zip")) {
      console.log("Invalid file type - not a ZIP file");
      showNotification({
        type: 'error',
        message: 'Please upload a ZIP file containing SCORM package'
      });
      return;
    }

    console.log("File validation passed, starting upload...");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("scorm", file);
      console.log("FormData created, making API call to uploadScorm...");

      const response = await lessonAPI.uploadScorm(formData);
      console.log("Upload successful, response:", response.data);
      setScormData(response.data);

      console.log("Auto-saving to lesson activity...");
      // Auto-save after successful upload
      await lessonAPI.updateScormActivity(lessonId, {
        ...response.data,
        isDraft: true,
      });
      console.log("Auto-save completed");
      showNotification({
        type: 'success',
        message: 'SCORM package uploaded successfully!'
      });
    } catch (error) {
      console.error("=== SCORM UPLOAD ERROR ===");
      console.error("Error type:", error.name);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      console.error("Full error object:", error);

      const errorMsg =
        error.response?.data?.error || "Error uploading SCORM package";
      showNotification({
        type: 'error',
        message: errorMsg
      });
    } finally {
      console.log("Upload process finished, setting uploading to false");
      setUploading(false);
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

      <div className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {!scormData.packageUrl ? (
            <ScormUpload
              uploading={uploading}
              onFileUpload={handleFileUpload}
            />
          ) : (
            <ScormPreview
              scormData={scormData}
              onDelete={() =>
                setScormData({
                  packageUrl: "",
                  version: "",
                  title: "",
                  description: "",
                  launchUrl: "",
                })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ScormLessonEditor;
