import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../store/slices/userSlice';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Settings, Globe, Clock, Building2, Linkedin, Twitter, Github, ExternalLink, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ProfileStats from '../components/profile/ProfileStats';

const ProfilePage = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminRequest, setAdminRequest] = useState(null);

  useEffect(() => {
    refreshUserData();
    fetchStats();
    fetchAdminRequest();
  }, []);

  const refreshUserData = async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.data.user.role !== user?.role) {
        dispatch(updateUser(res.data.user));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { userAPI } = await import('../services/api');
      const res = await userAPI.getProfileStats();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminRequest = async () => {
    try {
      const res = await api.get('/api/admin-requests/my-request');
      setAdminRequest(res.data);
    } catch (error) {
      console.log('No admin request found');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      student: { label: 'Student', color: 'bg-gray-100 text-gray-800' },
      instructor: { label: 'Instructor', color: 'bg-orange-100 text-orange-800' },
      admin: { label: 'Admin', color: 'bg-orange-100 text-orange-800' },
      superadmin: { label: 'Super Admin', color: 'bg-orange-100 text-orange-800' }
    };
    const config = roleConfig[role] || roleConfig.student;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
              <div className="h-24 sm:h-32 bg-gradient-to-r from-[#FF5A00] to-orange-600 rounded-t-lg sm:rounded-t-xl"></div>
              
              <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 sm:-mt-16 mb-4 sm:mb-6 gap-4">
                  <img src={user?.profilePicture} alt="Profile" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover" />
                  <button onClick={() => navigate('/profile/settings')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#FF5A00] text-white rounded-lg hover:bg-orange-600 transition-colors tap-target">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Edit Profile</span>
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h1>
                    <p className="text-sm sm:text-base text-gray-600">@{user?.username}</p>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    {getRoleBadge(user?.role)}
                    {adminRequest && adminRequest.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Admin Request Pending
                      </span>
                    )}
                  </div>

                  {adminRequest && (
                    <div className={`p-3 rounded-lg border ${
                      adminRequest.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                      adminRequest.status === 'approved' ? 'bg-green-50 border-green-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {adminRequest.status === 'pending' && <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />}
                        {adminRequest.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />}
                        {adminRequest.status === 'rejected' && <XCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            adminRequest.status === 'pending' ? 'text-yellow-800' :
                            adminRequest.status === 'approved' ? 'text-green-800' :
                            'text-red-800'
                          }`}>
                            Admin Request {adminRequest.status === 'pending' ? 'Under Review' : adminRequest.status.charAt(0).toUpperCase() + adminRequest.status.slice(1)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {adminRequest.requestType === 'institute' ? adminRequest.instituteName : adminRequest.organizationName}
                          </p>
                          {adminRequest.reviewDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Reviewed on {new Date(adminRequest.reviewDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {user?.bio && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{user.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4">
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A00] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-xs sm:text-sm font-medium truncate">{user?.email}</p>
                      </div>
                    </div>

                    {user?.phone && (
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A00] flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-xs sm:text-sm font-medium">{user.phone}</p>
                        </div>
                      </div>
                    )}

                    {user?.location && (
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A00] flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-xs sm:text-sm font-medium">{user.location}</p>
                        </div>
                      </div>
                    )}

                    {user?.timezone && (
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A00] flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500">Timezone</p>
                          <p className="text-xs sm:text-sm font-medium">{user.timezone}</p>
                        </div>
                      </div>
                    )}

                    {user?.language && (
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A00] flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500">Language</p>
                          <p className="text-xs sm:text-sm font-medium">{user.language === 'en' ? 'English' : user.language}</p>
                        </div>
                      </div>
                    )}

                    {user?.department && (
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A00] flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500">Department</p>
                          <p className="text-xs sm:text-sm font-medium truncate">{user.department.name}</p>
                        </div>
                      </div>
                    )}

                    {user?.createdAt && (
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A00] flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500">Member Since</p>
                          <p className="text-xs sm:text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {user?.expertise && user.expertise.length > 0 && (
                    <div className="pt-3 sm:pt-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {user.expertise.map((skill, idx) => (
                          <span key={idx} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-50 text-[#FF5A00] rounded-full text-xs font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {user?.socialLinks && (user.socialLinks.linkedin || user.socialLinks.twitter || user.socialLinks.github || user.socialLinks.website) && (
                    <div className="pt-3 sm:pt-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Social Links</p>
                      <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
                        {user.socialLinks.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF5A00] tap-target"><Linkedin className="w-5 h-5" /></a>}
                        {user.socialLinks.twitter && <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF5A00] tap-target"><Twitter className="w-5 h-5" /></a>}
                        {user.socialLinks.github && <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF5A00] tap-target"><Github className="w-5 h-5" /></a>}
                        {user.socialLinks.website && <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-[#FF5A00] hover:text-orange-600 tap-target"><ExternalLink className="w-5 h-5" /></a>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!loading && <ProfileStats stats={stats} role={user?.role} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
