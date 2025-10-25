import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, User, GraduationCap, Shield, Crown } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CreateUserModal from '../components/user/CreateUserModal';
import EditUserModal from '../components/user/EditUserModal';
import { userAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const roleIcons = {
  student: <User className="w-5 h-5 text-gray-500" />,
  instructor: <GraduationCap className="w-5 h-5 text-orange-500" />,
  admin: <Shield className="w-5 h-5 text-orange-600" />,
  superadmin: <Crown className="w-5 h-5 text-orange-700" />
};

const roleLabels = {
  student: 'Student',
  instructor: 'Instructor',
  admin: 'Admin',
  superadmin: 'Super Admin'
};

const UserManagementPage = () => {
  const { role: routeRole } = useParams();
  const { user } = useSelector(state => state.user);
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Role-based permissions
  const rolePermissions = {
    superadmin: ['admin', 'instructor', 'student'],
    admin: ['instructor', 'student'],
    instructor: ['student']
  };

  const availableRoles = rolePermissions[user?.role] || [];
  const pageTitle = routeRole ? `${roleLabels[routeRole]}s` : 'All Users';
  const fixedRole = routeRole || null;

  useEffect(() => {
    fetchUsers();
  }, [routeRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers(routeRole);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification({ type: 'error', message: 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      setCreating(true);
      const response = await userAPI.createUser(userData);
      setUsers(prev => [response.data, ...prev]);
      setIsModalOpen(false);
      showNotification({ type: 'success', message: 'User created successfully' });
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to create user' 
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      setUpdating(true);
      const response = await userAPI.updateUser(userId, userData);
      setUsers(prev => prev.map(u => u._id === userId ? response.data : u));
      setIsEditModalOpen(false);
      setEditingUser(null);
      showNotification({ type: 'success', message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to update user' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      showNotification({ type: 'success', message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to delete user' 
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(true); }} />
        
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{pageTitle}</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage user accounts and permissions</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 transition-colors tap-target w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span className="sm:inline">Create {fixedRole ? roleLabels[fixedRole] : 'User'}</span>
              </button>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 sm:top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-3 sm:px-6 py-8 sm:py-12 text-center text-sm sm:text-base text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-4">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                                <div className="md:hidden flex items-center gap-1 mt-1">
                                  {roleIcons[user.role]}
                                  <span className="text-xs text-gray-600">{roleLabels[user.role]}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {roleIcons[user.role]}
                              <span className="text-sm text-gray-900">{roleLabels[user.role]}</span>
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.createdBy ? `by ${user.createdBy.firstName} ${user.createdBy.lastName}` : 'Self-registered'}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="text-gray-400 hover:text-orange-500 p-1.5 sm:p-2 tap-target"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-gray-400 hover:text-red-500 p-1.5 sm:p-2 tap-target"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateUser={handleCreateUser}
        loading={creating}
        availableRoles={availableRoles}
        fixedRole={fixedRole}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onUpdateUser={handleUpdateUser}
        loading={updating}
        availableRoles={availableRoles}
        user={editingUser}
      />
    </div>
  );
};

export default UserManagementPage;
