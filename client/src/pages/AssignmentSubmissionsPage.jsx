import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiDownload, FiEye } from 'react-icons/fi';
import { lessonAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const AssignmentSubmissionsPage = () => {
  const { lessonId } = useParams();
  const { showNotification } = useNotification();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [lessonId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await lessonAPI.getAssignmentSubmissions(lessonId);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId) => {
    try {
      await lessonAPI.gradeAssignment(lessonId, submissionId, {
        marks: parseFloat(marks),
        feedback
      });
      showNotification({ type: 'success', message: 'Assignment graded successfully' });
      setSelectedSubmission(null);
      setMarks('');
      setFeedback('');
      fetchSubmissions();
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to grade assignment' });
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setMarks(submission.marks || '');
    setFeedback(submission.feedback || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Assignment Submissions</h1>

      <div className="bg-white rounded-lg shadow border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission._id}>
                  <td className="px-3 sm:px-4 md:px-6 py-4">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {submission.user?.firstName} {submission.user?.lastName}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">{submission.user?.email}</div>
                    <div className="md:hidden text-xs text-gray-500 mt-1">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                      submission.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {submission.status}
                    </span>
                    <div className="sm:hidden text-xs text-gray-600 mt-1">
                      {submission.marks !== null && submission.marks !== undefined ? `${submission.marks}/${submission.maxMarks}` : 'Not graded'}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.marks !== null && submission.marks !== undefined ? `${submission.marks}/${submission.maxMarks}` : 'Not graded'}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <a
                        href={`http://localhost:3000/api/assignment-lessons/${lessonId}/file/${submission.fileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tap-target text-blue-600 hover:text-blue-800 p-1"
                        title="View"
                      >
                        <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                      <a
                        href={`http://localhost:3000/api/assignment-lessons/${lessonId}/file/${submission.fileName}`}
                        download
                        className="tap-target text-green-600 hover:text-green-800 p-1"
                        title="Download"
                      >
                        <FiDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                      <button
                        onClick={() => openGradeModal(submission)}
                        className="tap-target px-2 sm:px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs sm:text-sm"
                      >
                        Grade
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Grade Assignment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Marks (out of {selectedSubmission.maxMarks})
                </label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  max={selectedSubmission.maxMarks}
                  min="0"
                  className="w-full px-3 py-2 border rounded-md text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-md text-sm sm:text-base resize-none"
                  placeholder="Provide feedback to the student..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="tap-target w-full sm:w-auto px-4 py-2 border rounded-md hover:bg-gray-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGradeSubmission(selectedSubmission._id)}
                  className="tap-target w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm sm:text-base"
                >
                  Submit Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissionsPage;
