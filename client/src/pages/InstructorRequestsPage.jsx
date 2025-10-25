import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, User, Building2, Briefcase } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const InstructorRequestsPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [instructorRequests, setInstructorRequests] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [requestType, setRequestType] = useState('instructor');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [instructorRes, adminRes] = await Promise.all([
        api.get('/api/instructor-requests'),
        api.get('/api/admin-requests')
      ]);
      setInstructorRequests(instructorRes.data);
      setAdminRequests(adminRes.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showNotification({ type: 'error', message: 'Failed to load requests' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      const endpoint = type === 'instructor' ? 'instructor-requests' : 'admin-requests';
      await api.post(`/api/${endpoint}/${id}/approve`);
      showNotification({ type: 'success', message: `${type === 'instructor' ? 'Instructor' : 'Admin'} request approved` });
      fetchRequests();
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to approve request' });
    }
  };

  const handleReject = async (id, type) => {
    try {
      const endpoint = type === 'instructor' ? 'instructor-requests' : 'admin-requests';
      await api.post(`/api/${endpoint}/${id}/reject`);
      showNotification({ type: 'success', message: `${type === 'instructor' ? 'Instructor' : 'Admin'} request rejected` });
      fetchRequests();
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to reject request' });
    }
  };

  const currentRequests = requestType === 'instructor' ? instructorRequests : adminRequests;
  const filteredRequests = currentRequests.filter(req => filter === 'all' || req.status === filter);

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarCollapsed} onClose={() => setSidebarCollapsed(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Role Requests</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">Review and approve role requests</p>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setRequestType('instructor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  requestType === 'instructor'
                    ? 'bg-[#FF5A00] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4" />
                Instructor
              </button>
              <button
                onClick={() => setRequestType('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  requestType === 'admin'
                    ? 'bg-[#FF5A00] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Admin
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              {['all', 'pending', 'approved', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === status
                      ? 'bg-[#FF5A00] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No {filter !== 'all' ? filter : ''} requests found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredRequests.map((request) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {request.user?.firstName?.[0]}{request.user?.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.user?.firstName} {request.user?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{request.user?.email}</p>
                          {requestType === 'admin' && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                {request.requestType === 'institute' ? <Building2 className="w-4 h-4 text-[#FF5A00]" /> : <Briefcase className="w-4 h-4 text-[#FF5A00]" />}
                                <span className="font-medium">{request.instituteName || request.organizationName}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Type: {request.instituteType || request.organizationType}
                              </p>
                              {request.instituteDomain && (
                                <p className="text-xs text-gray-500">
                                  Domain: {request.instituteDomain}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Phone: {request.institutePhone || request.organizationPhone}
                              </p>
                              {(request.instituteWebsite || request.organizationWebsite) && (
                                <p className="text-xs text-gray-500 truncate">
                                  Website: {request.instituteWebsite || request.organizationWebsite}
                                </p>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                          {request.reviewDate && (
                            <p className="text-xs text-gray-500">
                              Reviewed: {new Date(request.reviewDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {request.status}
                        </span>

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(request._id, requestType)}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(request._id, requestType)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorRequestsPage;
