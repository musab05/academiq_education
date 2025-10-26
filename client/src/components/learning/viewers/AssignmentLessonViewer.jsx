import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Calendar, Clock } from 'lucide-react';
import { lessonAPI, progressAPI } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';

const AssignmentLessonViewer = ({ lesson, onProgressUpdate }) => {
  const { showNotification } = useNotification();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submissionText, setSubmissionText] = useState('');
  const [assignmentProgress, setAssignmentProgress] = useState(null);

  useEffect(() => {
    if (lesson?._id) {
      fetchLessonData();
      fetchProgress();
    }
  }, [lesson?._id]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const response = await lessonAPI.getAssignmentActivity(lesson._id);
      setLessonData(response.data.activity);
    } catch (error) {
      console.error('Error fetching assignment lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await progressAPI.getAssignmentProgress(lesson._id);
      setAssignmentProgress(response.data);
    } catch (error) {
      console.error('Error fetching assignment progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    try {
      if (selectedFiles.length === 0) return;
      
      // Upload files first
      const uploadedFiles = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('lessonId', lesson._id);
        const uploadResponse = await lessonAPI.uploadAssignmentFile(formData);
        uploadedFiles.push(uploadResponse.data.filename);
      }
      
      // Submit with actual filenames
      const fileNames = uploadedFiles.join(', ');
      await progressAPI.submitAssignment(lesson._id, fileNames);
      showNotification({ type: 'success', message: 'Assignment submitted successfully!' });
      setSelectedFiles([]);
      setSubmissionText('');
      await fetchProgress();
      window.dispatchEvent(new Event('lessonCompleted'));
      if (onProgressUpdate) onProgressUpdate();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      showNotification({ type: 'error', message: 'Failed to submit assignment' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 lg:p-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Assignment
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Due: {lessonData?.dueDate ? new Date(lessonData.dueDate).toLocaleDateString() : 'No due date'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {lessonData?.estimatedTime || '2-3 hours'} estimated
          </span>
        </div>
      </div>

      {/* Assignment Status */}
      <div className={`border rounded-lg p-4 mb-8 ${
        assignmentProgress?.isCompleted ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-semibold ${
              assignmentProgress?.isCompleted ? 'text-green-800' : 'text-orange-800'
            }`}>Assignment Status</h3>
            <p className={`text-sm ${
              assignmentProgress?.isCompleted ? 'text-green-700' : 'text-orange-700'
            }`}>
              {assignmentProgress?.isCompleted ? 'Submitted' : 'Not submitted'}
              {assignmentProgress?.submittedAt && ` • ${new Date(assignmentProgress.submittedAt).toLocaleDateString()}`}
            </p>
            {assignmentProgress?.submittedFile && (
              <p className="text-sm text-gray-600 mt-1">Files: {assignmentProgress.submittedFile}</p>
            )}
            {assignmentProgress?.marks !== undefined && assignmentProgress?.marks !== null && (
              <div className="mt-2">
                <p className="text-sm font-semibold text-gray-700">Grade: {assignmentProgress.marks}/{lessonData?.maxPoints || 100}</p>
                {assignmentProgress?.feedback && (
                  <p className="text-sm text-gray-600 mt-1">Feedback: {assignmentProgress.feedback}</p>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              assignmentProgress?.marks !== undefined ? 'text-blue-600' : assignmentProgress?.isCompleted ? 'text-green-600' : 'text-orange-600'
            }`}>{assignmentProgress?.marks !== undefined ? assignmentProgress.marks : 0}/{lessonData?.maxPoints || 100}</div>
            <div className={`text-sm ${
              assignmentProgress?.marks !== undefined ? 'text-blue-600' : assignmentProgress?.isCompleted ? 'text-green-600' : 'text-orange-600'
            }`}>Points</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment Instructions */}
        <div className="lg:col-span-2">
          <div className="prose prose-lg max-w-none">
            <h2>Assignment Instructions</h2>
            <div>{lessonData?.instructions || 'Assignment instructions will be loaded here.'}</div>

            {lessonData?.attachments && lessonData.attachments.length > 0 && (
              <>
                <h3>Assignment Files</h3>
                <div className="space-y-3">
                  {lessonData.attachments.map((attachment, index) => (
                    <a key={index} href={attachment.url} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" download>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">{attachment.name}</div>
                        <div className="text-sm text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <h4 className="text-blue-800 font-semibold mb-2">💡 Tips for Success</h4>
              <ul className="text-blue-700 space-y-1">
                <li>Start early and plan your time effectively</li>
                <li>Review the lesson materials before beginning</li>
                <li>Use credible sources for your research</li>
                <li>Proofread your work before submission</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Assignment Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Max Points:</span>
                  <span className="ml-2 font-medium">{lessonData?.maxPoints || 100}</span>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span className="ml-2 font-medium">{lessonData?.dueDate ? new Date(lessonData.dueDate).toLocaleDateString() : 'No due date'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Submit Assignment</h3>
            
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                </label>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Files
                </label>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Submission */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Add any comments about your submission..."
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit Assignment
            </button>

            <p className="text-xs text-gray-500 mt-2 text-center">
              You can resubmit until the due date
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            ← Previous Lesson
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            Next Lesson →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AssignmentLessonViewer;