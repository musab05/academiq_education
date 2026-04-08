import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Eye } from "lucide-react";
import { lessonAPI, progressAPI } from "../../../services/api";

const DocumentLessonViewer = ({ lesson, onProgressUpdate }) => {
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lesson?._id) {
      // Reset state when lesson changes
      setLessonData(null);
      setLoading(true);

      fetchLessonData();
      markAsViewed();
    }
  }, [lesson?._id]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const response = await lessonAPI.getDocumentActivity(lesson._id);
      setLessonData(response.data.activity);
    } catch (error) {
      console.error("Error fetching document lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async () => {
    try {
      await progressAPI.markDocumentViewed(lesson._id);
      window.dispatchEvent(new Event("lessonCompleted"));
      if (onProgressUpdate) onProgressUpdate();
    } catch (error) {
      console.error("Error marking document as viewed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 lg:p-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {lesson.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Document Lesson
          </span>
          <span>
            {lessonData?.fileType || "PDF"} • {lessonData?.fileSize || "2.5 MB"}{" "}
            • {lessonData?.pages || "25"} pages
          </span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
        {/* Documents List */}
        <div className="space-y-4">
          {lessonData?.documents && lessonData.documents.length > 0 ? (
            lessonData.documents
              .sort((a, b) => a.order - b.order)
              .map((document, index) => (
                <div
                  key={document._id || index}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <FileText className="w-12 h-12 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {document.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {document.description || "Document for this lesson"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span>{document.fileType?.toUpperCase()}</span>
                          <span>
                            {(document.fileSize / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                          {document.allowDownload && (
                            <a
                              href={document.fileUrl}
                              download
                              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents available
              </h3>
              <p className="text-gray-500">
                Documents will appear here when added to this lesson.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-2">
            Document Overview
          </h3>
          <p className="text-orange-700">
            This document contains comprehensive information about the lesson
            topic. Review it carefully and take notes on key concepts.
          </p>
        </div>

        {lessonData?.viewerSettings && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-6">
            <h4 className="text-orange-800 font-semibold mb-2">
              📄 Document Settings
            </h4>
            <div className="text-orange-700 text-sm space-y-1">
              <div>
                Print allowed:{" "}
                {lessonData.viewerSettings.allowPrint ? "Yes" : "No"}
              </div>
              <div>
                Copy allowed:{" "}
                {lessonData.viewerSettings.allowCopy ? "Yes" : "No"}
              </div>
            </div>
          </div>
        )}
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

export default DocumentLessonViewer;
