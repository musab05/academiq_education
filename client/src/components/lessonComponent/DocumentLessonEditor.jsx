import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import { lessonAPI } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import LessonSettingsModal from "./LessonSettingsModal";

const DocumentLessonEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [lessonTitle, setLessonTitle] = useState("");
  const [documentData, setDocumentData] = useState({
    documents: [],
    viewerSettings: {
      allowPrint: true,
      allowCopy: true,
      watermark: "",
    },
  });
  const [savedDocumentData, setSavedDocumentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      const hasChanges = JSON.stringify(documentData) !== JSON.stringify(savedDocumentData);
      const hasDocuments = documentData.documents.length > 0 || savedDocumentData.documents?.length > 0;
      console.log('Auto-save check:', { hasChanges, hasDocuments, documentData, savedDocumentData });
      
      if (hasChanges && hasDocuments) {
        console.log('Auto-saving draft...', documentData);
        saveDraft();
      }
    }, 1000);
  }, [documentData, savedDocumentData]);

  const fetchLesson = async () => {
    try {
      console.log('Fetching lesson data for ID:', lessonId);
      const response = await lessonAPI.getDocumentActivity(lessonId);
      console.log('Fetched lesson response:', response.data);
      setLessonTitle(response.data.lesson.title);
      const activity = response.data.activity || {};
      console.log('Activity data:', activity);
      const data = {
        documents: activity.documents || [],
        viewerSettings: activity.viewerSettings || {
          allowPrint: true,
          allowCopy: true,
          watermark: "",
        },
      };
      console.log('Setting document data:', data);
      setDocumentData(data);
      setSavedDocumentData(data);
      setAttachments(response.data.lesson.attachments || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    try {
      console.log('Saving draft with data:', documentData);
      const response = await lessonAPI.updateDocumentActivity(lessonId, {
        ...documentData,
        isDraft: true,
      });
      console.log('Draft saved successfully:', response);
    } catch (error) {
      console.error("Error saving draft:", error);
      console.error("Error details:", error.response?.data);
      showNotification({
        type: 'error',
        message: 'Failed to auto-save draft'
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await lessonAPI.updateDocumentActivity(lessonId, {
        ...documentData,
        isDraft: false,
      });
      setSavedDocumentData(documentData);
      showNotification({
        type: 'success',
        message: 'Document lesson saved successfully!'
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
    setDocumentData(savedDocumentData);
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "xls",
      "xlsx",
      "txt",
    ];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      alert(
        "Please upload a valid document file (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT)"
      );
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("document", file);

      const uploadResponse = await lessonAPI.uploadDocument(formData);

      const newDocument = {
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileUrl: uploadResponse.data.fileUrl,
        fileType: fileExtension,
        fileSize: file.size,
        description: "",
        allowDownload: true,
        order: documentData.documents.length,
      };

      const updatedData = {
        ...documentData,
        documents: [...documentData.documents, newDocument],
      };

      setDocumentData(updatedData);
      showNotification({
        type: 'success',
        message: 'Document uploaded successfully!'
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      showNotification({
        type: 'error',
        message: 'Failed to upload document. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const updateDocument = (index, field, value) => {
    const updatedDocuments = documentData.documents.map((doc, i) =>
      i === index ? { ...doc, [field]: value } : doc
    );
    const updatedData = { ...documentData, documents: updatedDocuments };
    setDocumentData(updatedData);
  };

  const removeDocument = (index) => {
    const updatedDocuments = documentData.documents.filter(
      (_, i) => i !== index
    );
    const updatedData = { ...documentData, documents: updatedDocuments };
    setDocumentData(updatedData);
  };

  const moveDocument = (index, direction) => {
    const newDocuments = [...documentData.documents];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < documentData.documents.length) {
      [newDocuments[index], newDocuments[newIndex]] = [
        newDocuments[newIndex],
        newDocuments[index],
      ];

      newDocuments.forEach((doc, i) => {
        doc.order = i;
      });

      const updatedData = { ...documentData, documents: newDocuments };
      setDocumentData(updatedData);
    }
  };

  const updateViewerSettings = (field, value) => {
    const updatedSettings = { ...documentData.viewerSettings, [field]: value };
    const updatedData = { ...documentData, viewerSettings: updatedSettings };
    setDocumentData(updatedData);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Upload Documents</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="document-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                disabled={uploading}
              />
              <label
                htmlFor="document-upload"
                className={`inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white tap-target ${
                  uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : "Upload Document"}
              </label>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
              </p>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Documents ({documentData.documents.length})
            </h3>
            {documentData.documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No documents uploaded yet. Upload your first document above.
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {documentData.documents.map((doc, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Document Title
                          </label>
                          <input
                            type="text"
                            value={doc.title}
                            onChange={(e) =>
                              updateDocument(index, "title", e.target.value)
                            }
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter document title..."
                          />
                        </div>
                        <div className="mb-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                          </label>
                          <textarea
                            value={doc.description}
                            onChange={(e) =>
                              updateDocument(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            rows="2"
                            placeholder="Enter document description..."
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <span className="whitespace-nowrap">Type: {doc.fileType.toUpperCase()}</span>
                          <span className="whitespace-nowrap">Size: {formatFileSize(doc.fileSize)}</span>
                          <label className="flex items-center whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={doc.allowDownload}
                              onChange={(e) =>
                                updateDocument(
                                  index,
                                  "allowDownload",
                                  e.target.checked
                                )
                              }
                              className="mr-1 tap-target"
                            />
                            Allow Download
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1 sm:space-y-2">
                        <button
                          onClick={() => moveDocument(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 sm:p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 tap-target"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveDocument(index, "down")}
                          disabled={index === documentData.documents.length - 1}
                          className="p-1.5 sm:p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 tap-target"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeDocument(index)}
                          className="p-1.5 sm:p-1 text-red-400 hover:text-red-600 tap-target"
                          title="Remove document"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Viewer Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Viewer Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={documentData.viewerSettings.allowPrint}
                  onChange={(e) =>
                    updateViewerSettings("allowPrint", e.target.checked)
                  }
                  className="mr-2 tap-target"
                />
                Allow Printing
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={documentData.viewerSettings.allowCopy}
                  onChange={(e) =>
                    updateViewerSettings("allowCopy", e.target.checked)
                  }
                  className="mr-2 tap-target"
                />
                Allow Copy/Paste
              </label>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Watermark Text (Optional)
              </label>
              <input
                type="text"
                value={documentData.viewerSettings.watermark}
                onChange={(e) =>
                  updateViewerSettings("watermark", e.target.value)
                }
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter watermark text..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentLessonEditor;