import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import { lessonAPI } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import TextEditor from "./text/TextEditor";
import LessonSettingsModal from "./LessonSettingsModal";
import AIAssistant from "./AIAssistant";

const TextLessonEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [lessonTitle, setLessonTitle] = useState("");
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const editorRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const handleEditorChange = (content) => {
    setContent(content);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (content !== savedContent) {
        saveDraft(content);
      }
    }, 1000);
  };

  const fetchLesson = async () => {
    try {
      const response = await lessonAPI.getTextActivity(lessonId);
      setLessonTitle(response.data.lesson.title);
      setContent(response.data.activity?.sections?.[0]?.content || "");
      setSavedContent(response.data.activity?.sections?.[0]?.content || "");
      setAttachments(response.data.lesson.attachments || []);
      setCourseId(response.data.lesson.course);
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

  const saveDraft = async (contentToSave = content) => {
    try {
      await lessonAPI.updateTextActivity(lessonId, {
        sections: [
          {
            type: "paragraph",
            content: contentToSave,
            order: 0,
          },
        ],
        isDraft: true,
      });
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
      await lessonAPI.updateTextActivity(lessonId, {
        sections: [
          {
            type: "paragraph",
            content: content,
            order: 0,
          },
        ],
        isDraft: false,
      });
      setSavedContent(content);
      showNotification({
        type: 'success',
        message: 'Text lesson saved successfully!'
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
    setContent(savedContent);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading lesson...</p>
        </div>
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
        <TextEditor content={content} onChange={handleEditorChange} editorRef={editorRef} />
      </div>

      <AIAssistant 
        lessonId={lessonId} 
        courseId={courseId}
        editorRef={editorRef}
      />
    </div>
  );
};

export default TextLessonEditor;
