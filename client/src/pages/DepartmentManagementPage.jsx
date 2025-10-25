import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import CreateDepartmentModal from '../components/department/CreateDepartmentModal';
import AddMemberModal from '../components/department/AddMemberModal';
import DepartmentTable from '../components/department/DepartmentTable';
import { departmentAPI, userAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const DepartmentManagementPage = () => {
  const { user } = useSelector(state => state.user);
  const currentUser = useSelector((state) => state.user.user);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role === 'student') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [tree, setTree] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(null);
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data.flat || []);
      setTree(response.data.tree || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showNotification({ type: 'error', message: 'Failed to fetch departments' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dept) => {
    setEditing(dept);
    setIsModalOpen(true);
  };

  const handleCreateDepartment = async (departmentData) => {
    try {
      setCreating(true);
      if (editing) {
        await departmentAPI.updateDepartment(editing._id, departmentData);
        showNotification({ type: 'success', message: 'Department updated successfully' });
      } else {
        await departmentAPI.createDepartment(departmentData);
        showNotification({ type: 'success', message: 'Department created successfully' });
      }
      setIsModalOpen(false);
      await fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to save department' 
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete department?')) return;
    setLoading(true);
    try {
      await departmentAPI.deleteDepartment(id);
      showNotification({ type: 'success', message: 'Department deleted' });
      await fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      showNotification({
        type: 'error',
        message: error?.response?.data?.error || 'Delete failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId, role = 'member') => {
    if (!showAddMemberModal) return;
    
    try {
      setAddingMember(true);
      const response = await departmentAPI.addMember(showAddMemberModal, { userId, role });
      setDepartments(prev => prev.map(d => d._id === showAddMemberModal ? response.data : d));
      setShowAddMemberModal(null);
      showNotification({ type: 'success', message: 'Member added successfully' });
    } catch (error) {
      console.error('Error adding member:', error);
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to add member' 
      });
    } finally {
      setAddingMember(false);
    }
  };

  const getAvailableUsers = (departmentId) => {
    const department = departments.find(d => d._id === departmentId);
    const departmentMemberIds = department?.members.map(m => m.user._id) || [];
    return users.filter(u => !departmentMemberIds.includes(u._id));
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => {
          if (window.innerWidth < 1024) setSidebarOpen(true);
          else setSidebarCollapsed(!sidebarCollapsed);
        }} />
        
        <div className="flex flex-1">
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Department Management</h2>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {loading && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Loading...</span>
                    </div>
                  )}
                  {currentUser?.role !== 'student' && (
                    <button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 sm:gap-2 shadow-sm text-sm sm:text-base tap-target"
                      onClick={handleCreate}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Create Department</span>
                      <span className="sm:hidden">Create</span>
                    </button>
                  )}
                </div>
              </div>

              <DepartmentTable
                departments={departments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddMember={(id) => setShowAddMemberModal(id)}
              />
            </div>
          </div>
        </div>
      </div>

      <CreateDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateDepartment={handleCreateDepartment}
        loading={creating}
        users={users}
        departments={departments}
        department={editing}
      />

      <AddMemberModal
        isOpen={!!showAddMemberModal}
        onClose={() => setShowAddMemberModal(null)}
        availableUsers={showAddMemberModal ? getAvailableUsers(showAddMemberModal) : []}
        onAddMember={handleAddMember}
        loading={addingMember}
      />
    </div>
  );
};

export default DepartmentManagementPage;
