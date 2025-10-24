import React, { useState } from "react";
import { Upload, File, Trash2, Download } from "lucide-react";
import { lessonAPI } from "../../../services/api";

const ResourceUpload = ({ attachments, onUpdate, lessonId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const maxSize = 50 * 1024 * 1024; // 50MB default
        if (file.size > maxSize) {
          throw new Error(
            `File ${file.name} is too large. Maximum size is ${
              maxSize / 1024 / 1024
            }MB`
          );
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("lessonId", lessonId);

        const response = await lessonAPI.uploadResourceFile(formData);

        return {
          id: Date.now() + Math.random(),
          name: file.name,
          url: response.data.url,
          type: file.type,
          size: file.size,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const updatedAttachments = [...(attachments || []), ...uploadedFiles];
      console.log("Attachments updated:", updatedAttachments);
      onUpdate({ attachments: updatedAttachments });
    } catch (error) {
      console.error("Error uploading files:", error);
      alert(error.message || "Error uploading files");
    } finally {
      setUploading(false);
    }
  };

  const removeResource = (resourceId) => {
    const updatedAttachments = attachments.filter((r) => r.id !== resourceId);
    onUpdate({ attachments: updatedAttachments });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("powerpoint") || type.includes("presentation"))
      return "📊";
    if (type.includes("video/")) return "🎥";
    if (type.includes("audio/")) return "🎵";
    return "📁";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Reference Attachments
        </h3>
        <span className="text-sm text-gray-500">
          {attachments?.length || 0} file{attachments?.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-orange-400 bg-orange-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="mx-auto w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Uploading files...</p>
          </div>
        ) : (
          <>
            <input
              type="file"
              multiple
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Upload className="mx-auto w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              <span className="font-medium text-orange-600">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Any file type supported
            </p>
          </>
        )}
      </div>

      {attachments && attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id || `attachment-${index}-${attachment.name}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
            >
              <span className="text-lg">{getFileIcon(attachment.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={attachment.url}
                  download={attachment.name}
                  className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                  title="Download"
                >
                  <Download size={14} />
                </a>
                <button
                  onClick={() => removeResource(attachment.id)}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceUpload;
