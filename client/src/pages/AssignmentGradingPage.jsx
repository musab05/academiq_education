import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, Calendar, User, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { lessonAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const AssignmentGradingPage = () => {
  const { lessonId } = useParams();
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [lessonId]);

  const fetchSubmissions = async () => {
    try {
      const res = await lessonAPI.getAssignmentSubmissions(lessonId);
      console.log('Submissions response:', res.data);
      setSubmissions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      showNotification({ type: 'error', message: 'Failed to load submissions' });
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!marks || marks < 0 || marks > selectedSubmission.maxMarks) {
      showNotification({ type: 'error', message: 'Invalid marks' });
      return;
    }

    try {
      setGrading(true);
      await lessonAPI.gradeAssignment(lessonId, selectedSubmission._id, { marks: Number(marks), feedback });
      showNotification({ type: 'success', message: 'Assignment graded successfully' });
      setSelectedSubmission(null);
      setMarks('');
      setFeedback('');
      fetchSubmissions();
    } catch (error) {
      console.error('Error grading:', error);
      showNotification({ type: 'error', message: 'Failed to grade assignment' });
    } finally {
      setGrading(false);
    }
  };

  const openGradingModal = (submission) => {
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        isOpen={sidebarCollapsed} 
        onClose={() => setSidebarCollapsed(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Assignment Submissions</h1>
              <p className="text-sm sm:text-base text-gray-600">Review and grade student submissions</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Student</th>
                      <th className="hidden md:table-cell px-4 md:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Submitted</th>
                      <th className="hidden lg:table-cell px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">File</th>
                      <th className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="hidden sm:table-cell px-4 md:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Marks</th>
                      <th className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {submissions.map((sub) => (
                      <tr key={sub._id} className="hover:bg-orange-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                              {sub.user?.firstName?.[0]}{sub.user?.lastName?.[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {sub.user?.firstName} {sub.user?.lastName}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 truncate">{sub.user?.email}</div>
                              <div className="md:hidden text-xs text-gray-500 mt-1">
                                {new Date(sub.submittedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 md:px-6 lg:px-8 py-4 sm:py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-6 lg:px-8 py-4 sm:py-5">
                          <a href={sub.fileUrl} className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium">
                            <FileText className="w-4 h-4" />
                            <span className="truncate">{sub.fileName || 'Download'}</span>
                          </a>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5">
                          <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                            sub.status === 'graded' 
                              ? 'bg-green-100 text-green-700' 
                              : sub.status === 'late'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {sub.status === 'graded' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span className="hidden sm:inline">{sub.status}</span>
                          </span>
                          <div className="sm:hidden text-xs text-gray-600 mt-1">
                            {sub.marks !== undefined ? `${sub.marks}/${sub.maxMarks}` : '-'}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 lg:px-8 py-4 sm:py-5">
                          <div className="text-sm font-semibold text-gray-900">
                            {sub.marks !== undefined ? `${sub.marks}/${sub.maxMarks}` : '-'}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5">
                          <button
                            onClick={() => openGradingModal(sub)}
                            className="tap-target text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-semibold"
                          >
                            {sub.status === 'graded' ? 'Re-grade' : 'Grade'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {submissions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No submissions yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Grade Assignment</h2>
            
            <div className="mb-4 sm:mb-6">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Student</div>
              <div className="font-semibold text-sm sm:text-base text-gray-900">
                {selectedSubmission.user?.firstName} {selectedSubmission.user?.lastName}
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Submitted File</div>
              <a href={selectedSubmission.fileUrl} className="text-orange-600 hover:text-orange-700 flex items-center gap-2 font-medium text-sm sm:text-base">
                <Download className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{selectedSubmission.fileName || 'Download Submission'}</span>
              </a>
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Marks (out of {selectedSubmission.maxMarks})
              </label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                min="0"
                max={selectedSubmission.maxMarks}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                placeholder={`Enter marks (0-${selectedSubmission.maxMarks})`}
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base resize-none"
                placeholder="Provide feedback to the student..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="tap-target w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors text-sm sm:text-base"
                disabled={grading}
              >
                Cancel
              </button>
              <button
                onClick={handleGrade}
                disabled={grading}
                className="tap-target w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 font-medium transition-all text-sm sm:text-base"
              >
                {grading ? 'Saving...' : 'Submit Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentGradingPage;
