import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import { lessonAPI } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import VideoUpload from "./video/VideoUpload";
import VideoPlayer from "./video/VideoPlayer";
import VideoSettings from "./video/VideoSettings";
import LessonSettingsModal from "./LessonSettingsModal";

const VideoLessonEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoData, setVideoData] = useState({
    videoUrl: "",
    videoType: "youtube", // 'youtube', 'vimeo', 'upload'
    sourceType: "link", // 'link' or 'upload'
    autoplay: false,
    allowDownload: false,
    subtitles: [],
    chapters: [],
  });
  const [savedVideoData, setSavedVideoData] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const handleVideoDataChange = (field, value) => {
    const newData = { ...videoData, [field]: value };
    setVideoData(newData);

    // Auto-save draft
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveDraft(newData);
    }, 1000);
  };

  const fetchLesson = async () => {
    try {
      const response = await lessonAPI.getVideoActivity(lessonId);
      setLessonTitle(response.data.lesson.title);
      const activity = response.data.activity || {};
      setVideoData({
        videoUrl: activity.videoUrl || "",
        videoType: getVideoType(activity.videoUrl || ""),
        sourceType: activity.sourceType || "link",
        autoplay: activity.autoplay || false,
        allowDownload: activity.allowDownload || false,
        subtitles: activity.subtitles || [],
        chapters: activity.chapters || [],
      });
      setSavedVideoData(activity);
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

  const getVideoType = (url) => {
    if (!url) return "youtube";
    const urlLower = url.toLowerCase();
    if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be"))
      return "youtube";
    if (urlLower.includes("vimeo.com")) return "vimeo";
    return "upload";
  };

  const saveDraft = async (dataToSave = videoData) => {
    try {
      console.log("Saving draft:", dataToSave);
      const response = await lessonAPI.updateVideoActivity(lessonId, {
        videoUrl: dataToSave.videoUrl,
        sourceType: dataToSave.sourceType,
        autoplay: dataToSave.autoplay,
        allowDownload: dataToSave.allowDownload,
        subtitles: dataToSave.subtitles || [],
        chapters: dataToSave.chapters || [],
        isDraft: true,
      });
      console.log("Draft saved:", response.data);
    } catch (error) {
      console.error("Error saving draft:", error);
      showNotification({
        type: 'error',
        message: 'Failed to auto-save draft'
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("Saving lesson:", videoData);
      const response = await lessonAPI.updateVideoActivity(lessonId, {
        videoUrl: videoData.videoUrl,
        sourceType: videoData.sourceType,
        autoplay: videoData.autoplay,
        allowDownload: videoData.allowDownload,
        subtitles: videoData.subtitles || [],
        chapters: videoData.chapters || [],
        isDraft: false,
      });
      console.log("Lesson saved:", response.data);
      setSavedVideoData(videoData);
      showNotification({
        type: 'success',
        message: 'Video lesson saved successfully!'
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
    setVideoData({
      videoUrl: savedVideoData.videoUrl || "",
      videoType: getVideoType(savedVideoData.videoUrl || ""),
      sourceType: savedVideoData.sourceType || "link",
      autoplay: savedVideoData.autoplay || false,
      allowDownload: savedVideoData.allowDownload || false,
      subtitles: savedVideoData.subtitles || [],
      chapters: savedVideoData.chapters || [],
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
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);

      const response = await lessonAPI.uploadVideo(formData);
      console.log("Upload response:", response.data);

      const newVideoData = {
        ...videoData,
        videoUrl: response.data.videoUrl,
        videoType: "upload",
        sourceType: "upload",
      };

      setVideoData(newVideoData);

      // Immediately save to database
      saveDraft(newVideoData);
      showNotification({
        type: 'success',
        message: 'Video uploaded successfully!'
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      showNotification({
        type: 'error',
        message: 'Failed to upload video. Please try again.'
      });
    } finally {
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
          {videoData.videoUrl ? (
            <VideoPlayer
              videoData={videoData}
              onRemove={() => handleVideoDataChange("videoUrl", "")}
            />
          ) : (
            <VideoUpload
              uploading={uploading}
              onFileUpload={handleFileUpload}
              onUrlSubmit={(url) => {
                const newVideoData = {
                  ...videoData,
                  videoUrl: url,
                  videoType: getVideoType(url),
                  sourceType: "link",
                };
                setVideoData(newVideoData);
                saveDraft(newVideoData);
              }}
            />
          )}

          {videoData.videoUrl && (
            <VideoSettings
              videoData={videoData}
              onChange={handleVideoDataChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLessonEditor;
