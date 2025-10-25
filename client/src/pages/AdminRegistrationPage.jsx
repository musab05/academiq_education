import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Briefcase, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CustomSelect from '../components/common/CustomSelect';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const AdminRegistrationPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const { showNotification } = useNotification();
  const [requestType, setRequestType] = useState('institute');
  const [useCurrentUser, setUseCurrentUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    instituteName: '',
    instituteType: '',
    instituteDomain: '',
    instituteAddress: '',
    institutePhone: '',
    instituteWebsite: '',
    organizationName: '',
    organizationType: '',
    organizationAddress: '',
    organizationPhone: '',
    organizationWebsite: ''
  });

  const BLOCKED_DOMAINS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
    'icloud.com', 'aol.com', 'mail.com', 'protonmail.com', 'zoho.com',
    'yandex.com', 'gmx.com', 'inbox.com', 'mail.ru'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!useCurrentUser) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        showNotification({ type: 'error', message: 'Please fill all user details' });
        return;
      }
      if (formData.password.length < 8) {
        showNotification({ type: 'error', message: 'Password must be at least 8 characters' });
        return;
      }
    }

    if (requestType === 'institute' && formData.instituteDomain) {
      const domain = formData.instituteDomain.toLowerCase().trim();
      if (BLOCKED_DOMAINS.includes(domain)) {
        showNotification({ type: 'error', message: 'Please use your institute\'s official domain, not personal email domains' });
        return;
      }
    }
    
    setLoading(true);

    try {
      const payload = {
        requestType,
        ...formData,
        ...(useCurrentUser && user ? { userId: user._id } : {})
      };

      await api.post('/api/admin-requests', payload);
      showNotification({ type: 'success', message: 'Admin request submitted successfully!' });
      navigate('/');
    } catch (error) {
      showNotification({ type: 'error', message: error.response?.data?.message || 'Failed to submit request' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#FF5A00] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join as Admin</h1>
            <p className="text-gray-600">Register your institute or organization</p>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCurrentUser}
                  onChange={(e) => setUseCurrentUser(e.target.checked)}
                  className="w-5 h-5 text-[#FF5A00] rounded focus:ring-[#FF5A00]"
                />
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    Use current account ({user.firstName} {user.lastName})
                  </span>
                </div>
              </label>
              <p className="text-sm text-gray-600 mt-2 ml-8">
                Your current role: <span className="font-semibold capitalize">{user.role}</span>
              </p>
            </div>
          )}

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setRequestType('institute')}
              className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                requestType === 'institute'
                  ? 'border-[#FF5A00] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building2 className={`w-12 h-12 mx-auto mb-3 ${requestType === 'institute' ? 'text-[#FF5A00]' : 'text-gray-400'}`} />
              <h3 className="font-semibold text-lg mb-1">Institute</h3>
              <p className="text-sm text-gray-600">Educational institutions</p>
            </button>

            <button
              onClick={() => setRequestType('organization')}
              className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                requestType === 'organization'
                  ? 'border-[#FF5A00] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Briefcase className={`w-12 h-12 mx-auto mb-3 ${requestType === 'organization' ? 'text-[#FF5A00]' : 'text-gray-400'}`} />
              <h3 className="font-semibold text-lg mb-1">Organization</h3>
              <p className="text-sm text-gray-600">Corporate training</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!useCurrentUser && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="8"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                    placeholder="Enter password (min 8 characters)"
                  />
                </div>
              </>
            )}

            {requestType === 'institute' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institute Name *</label>
                  <input
                    type="text"
                    name="instituteName"
                    value={formData.instituteName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                    placeholder="Enter institute name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institute Type *</label>
                    <CustomSelect
                      options={[
                        { value: '', label: 'Select type' },
                        { value: 'school', label: 'School' },
                        { value: 'college', label: 'College' },
                        { value: 'university', label: 'University' },
                        { value: 'training_center', label: 'Training Center' },
                        { value: 'other', label: 'Other' }
                      ]}
                      value={formData.instituteType}
                      onChange={(value) => setFormData({ ...formData, instituteType: value })}
                      placeholder="Select type"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institute Domain *</label>
                    <input
                      type="text"
                      name="instituteDomain"
                      value={formData.instituteDomain}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                      placeholder="e.g., vit.edu.in"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter your institute's official email domain (not gmail, yahoo, etc.)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    name="instituteAddress"
                    value={formData.instituteAddress}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="institutePhone"
                      value={formData.institutePhone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      name="instituteWebsite"
                      value={formData.instituteWebsite}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                    placeholder="Enter organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type *</label>
                  <CustomSelect
                    options={[
                      { value: '', label: 'Select type' },
                      { value: 'corporate', label: 'Corporate' },
                      { value: 'startup', label: 'Startup' },
                      { value: 'nonprofit', label: 'Non-Profit' },
                      { value: 'government', label: 'Government' },
                      { value: 'other', label: 'Other' }
                    ]}
                    value={formData.organizationType}
                    onChange={(value) => setFormData({ ...formData, organizationType: value })}
                    placeholder="Select type"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    name="organizationAddress"
                    value={formData.organizationAddress}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="organizationPhone"
                      value={formData.organizationPhone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      name="organizationWebsite"
                      value={formData.organizationWebsite}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF5A00] hover:bg-[#FF7A33] text-white font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminRegistrationPage;
