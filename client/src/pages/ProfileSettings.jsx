import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Lock, Save, Eye, EyeOff, RefreshCw, Building2, UserCheck, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ProfilePictureUpload from '../components/profile/ProfilePictureUpload';
import DepartmentSelector from '../components/profile/DepartmentSelector';
import { userAPI, departmentAPI } from '../services/api';
import { setUserSession } from '../store/slices/userSlice';
import { useNotification } from '../context/NotificationContext';

const ProfileSettings = () => {
  const { user, token } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', email: '', username: '', department: '', phone: '', bio: '', location: '', timezone: 'UTC', language: 'en', expertise: [], socialLinks: { linkedin: '', twitter: '', github: '', website: '' }
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState({ profile: false, password: false, picture: false, reset: false });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [profileData, setProfileData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [adminRequest, setAdminRequest] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchDepartments();
    fetchAdminRequest();
  }, []);

  useEffect(() => {
    if (profileData) {
      setProfileForm({
        firstName: profileData.firstName || '', lastName: profileData.lastName || '', email: profileData.email || '', username: profileData.username || '', department: profileData.department?._id || '', phone: profileData.phone || '', bio: profileData.bio || '', location: profileData.location || '', timezone: profileData.timezone || 'UTC', language: profileData.language || 'en', expertise: profileData.expertise || [], socialLinks: { linkedin: profileData.socialLinks?.linkedin || '', twitter: profileData.socialLinks?.twitter || '', github: profileData.socialLinks?.github || '', website: profileData.socialLinks?.website || '' }
      });
    }
  }, [profileData]);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getCurrentProfile();
      setProfileData(response.data);
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to load profile data' });
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data);
    } catch (error) {
      console.log('Failed to load departments:', error);
    }
  };

  const fetchAdminRequest = async () => {
    try {
      const response = await userAPI.get('/admin-requests/my-request');
      setAdminRequest(response.data);
    } catch (error) {
      console.log('No admin request found');
    }
  };



  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, profile: true });
    try {
      const response = await userAPI.updateProfile(profileForm);
      setProfileData(response.data);
      dispatch(setUserSession({ user: response.data, token }));
      showNotification({ type: 'success', message: 'Profile updated successfully' });
    } catch (error) {
      showNotification({ type: 'error', message: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading({ ...loading, profile: false });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showNotification({ type: 'error', message: 'New password must be at least 8 characters long' });
      return;
    }
    setLoading({ ...loading, password: true });
    try {
      await userAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification({ type: 'success', message: 'Password changed successfully' });
    } catch (error) {
      showNotification({ type: 'error', message: error.response?.data?.error || 'Failed to change password' });
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  const handleUpdateProfilePicture = async (url) => {
    if (!url) {
      showNotification({ type: 'error', message: 'Please provide a valid image' });
      return;
    }
    setLoading({ ...loading, picture: true });
    try {
      const response = await userAPI.updateProfilePicture({ profilePicture: url });
      setProfileData({ ...profileData, profilePicture: response.data.profilePicture });
      dispatch(setUserSession({ user: { ...user, profilePicture: response.data.profilePicture }, token }));
      showNotification({ type: 'success', message: 'Profile picture updated successfully' });
    } catch (error) {
      showNotification({ type: 'error', message: error.response?.data?.error || 'Failed to update profile picture' });
    } finally {
      setLoading({ ...loading, picture: false });
    }
  };

  const handleResetProfilePicture = async () => {
    setLoading({ ...loading, reset: true });
    try {
      const response = await userAPI.resetProfilePicture();
      const newProfilePicture = response.data.profilePicture;
      setProfileData({ ...profileData, profilePicture: newProfilePicture });
      dispatch(setUserSession({ user: { ...user, profilePicture: newProfilePicture }, token }));
      showNotification({ type: 'success', message: 'Profile picture reset to default' });
    } catch (error) {
      showNotification({ type: 'error', message: error.response?.data?.error || 'Failed to reset profile picture' });
    } finally {
      setLoading({ ...loading, reset: false });
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      student: { label: 'Student', color: 'bg-gray-100 text-gray-800', icon: User },
      instructor: { label: 'Instructor', color: 'bg-orange-100 text-orange-800', icon: UserCheck },
      admin: { label: 'Admin', color: 'bg-orange-100 text-orange-800', icon: Shield },
      superadmin: { label: 'Super Admin', color: 'bg-orange-100 text-orange-800', icon: Shield }
    };
    const config = roleConfig[role] || roleConfig.student;
    const IconComponent = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#FF5A00]" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-1">
                <ProfilePictureUpload profilePicture={profileData.profilePicture} onUpdate={handleUpdateProfilePicture} onReset={handleResetProfilePicture} loading={loading} />

                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-4 sm:mt-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Account Information</h2>
                  
                  {adminRequest && (
                    <div className={`mb-4 p-3 rounded-lg border ${
                      adminRequest.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                      adminRequest.status === 'approved' ? 'bg-green-50 border-green-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {adminRequest.status === 'pending' && <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
                        {adminRequest.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                        {adminRequest.status === 'rejected' && <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${
                            adminRequest.status === 'pending' ? 'text-yellow-800' :
                            adminRequest.status === 'approved' ? 'text-green-800' :
                            'text-red-800'
                          }`}>
                            Admin Request {adminRequest.status.charAt(0).toUpperCase() + adminRequest.status.slice(1)}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 truncate">
                            {adminRequest.requestType === 'institute' ? adminRequest.instituteName : adminRequest.organizationName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Role</label>
                      <div className="mt-1">{getRoleBadge(profileData.role)}</div>
                    </div>
                    {profileData.institute && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600">Institute</label>
                        <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm text-gray-900">
                          <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">{profileData.institute.name}</span>
                        </div>
                      </div>
                    )}
                    {profileData.department && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600">Department</label>
                        <div className="mt-1 text-xs sm:text-sm text-gray-900 truncate">{profileData.department.name}</div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Member Since</label>
                      <div className="mt-1 text-xs sm:text-sm text-gray-900">{new Date(profileData.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      Profile Information
                    </h2>
                  </div>
                  
                  <form onSubmit={handleProfileSubmit} className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">First Name</label>
                        <input type="text" required value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Last Name</label>
                        <input type="text" required value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email</label>
                        <input type="email" required value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Username</label>
                        <input type="text" required value={profileForm.username} onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                      </div>
                      
                      {(user?.role === 'admin' || user?.role === 'superadmin') && departments.length > 0 && (
                        <div className="sm:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Department</label>
                          <DepartmentSelector departments={departments} value={profileForm.department} onChange={(value) => setProfileForm({ ...profileForm, department: value })} />
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Phone Number</label>
                        <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Enter phone number" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Location</label>
                        <input type="text" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="City, Country" />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Bio</label>
                        <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} maxLength={500} rows={3} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Tell us about yourself..." />
                        <p className="mt-1 text-xs text-gray-500">{profileForm.bio.length}/500 characters</p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Expertise / Skills</label>
                        <div className="flex gap-2 mb-2">
                          <input type="text" value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (expertiseInput.trim() && !profileForm.expertise.includes(expertiseInput.trim())) { setProfileForm({ ...profileForm, expertise: [...profileForm.expertise, expertiseInput.trim()] }); setExpertiseInput(''); } } }} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Add a skill and press Enter" />
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {profileForm.expertise.map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-50 text-[#FF5A00] rounded-full text-xs sm:text-sm">
                              {skill}
                              <button type="button" onClick={() => setProfileForm({ ...profileForm, expertise: profileForm.expertise.filter((_, i) => i !== idx) })} className="hover:text-orange-900 tap-target">×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Timezone</label>
                        <select value={profileForm.timezone} onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                          <option value="Asia/Shanghai">Shanghai</option>
                          <option value="Asia/Kolkata">India</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Language</label>
                        <select value={profileForm.language} onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                          <option value="pt">Portuguese</option>
                          <option value="zh">Chinese</option>
                          <option value="ja">Japanese</option>
                          <option value="ko">Korean</option>
                          <option value="ar">Arabic</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Social Links</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <input type="url" value={profileForm.socialLinks.linkedin} onChange={(e) => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, linkedin: e.target.value } })} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="LinkedIn URL" />
                          <input type="url" value={profileForm.socialLinks.twitter} onChange={(e) => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, twitter: e.target.value } })} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Twitter URL" />
                          <input type="url" value={profileForm.socialLinks.github} onChange={(e) => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, github: e.target.value } })} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="GitHub URL" />
                          <input type="url" value={profileForm.socialLinks.website} onChange={(e) => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, website: e.target.value } })} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Website URL" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-6 flex justify-end">
                      <button type="submit" disabled={loading.profile} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#FF5A00] text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm tap-target">
                        {loading.profile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Change Password
                    </h2>
                  </div>
                  
                  <form onSubmit={handlePasswordSubmit} className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Current Password</label>
                        <div className="relative">
                          <input type={showPasswords.current ? 'text' : 'password'} required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                          <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 tap-target">
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">New Password</label>
                        <div className="relative">
                          <input type={showPasswords.new ? 'text' : 'password'} required minLength="8" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                          <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 tap-target">
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input type={showPasswords.confirm ? 'text' : 'password'} required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                          <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 tap-target">
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-6 flex justify-end">
                      <button type="submit" disabled={loading.password} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm tap-target">
                        {loading.password ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
