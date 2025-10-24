import React, { useState } from 'react';
import { X, Paperclip, Trash2, Upload } from 'lucide-react';
import { lessonAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const LessonSettingsModal = ({ isOpen, onClose, lessonId, attachments = [], onAttachmentsUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const { showNotification } = useNotification();

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await lessonAPI.uploadAttachment(lessonId, formData);
      onAttachmentsUpdate([...attachments, response.data]);
      showNotification({ type: 'success', message: 'Attachment uploaded successfully' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to upload attachment' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    try {
      await lessonAPI.deleteAttachment(lessonId, attachmentId);
      onAttachmentsUpdate(attachments.filter(a => a._id !== attachmentId));
      showNotification({ type: 'success', message: 'Attachment deleted' });
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to delete attachment' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-96 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Lesson Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium">Attachments</h3>
            </div>

            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Upload File'}
              </span>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <div className="mt-4 space-y-2">
              {attachments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No attachments yet</p>
              ) : (
                attachments.map((attachment) => (
                  <div
                    key={attachment._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(attachment._id)}
                      className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonSettingsModal;
