import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BarChart3, Settings, Edit, Trash2, Building2 } from 'lucide-react';
import { instituteAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import AddInstituteModal from './AddInstituteModal';
import EditInstituteModal from './EditInstituteModal';
import InstituteSettingsModal from './InstituteSettingsModal';

const InstitutesPage = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState(null);
  const [settingsInstitute, setSettingsInstitute] = useState(null);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      const response = await instituteAPI.getAll();
      setInstitutes(response.data);
    } catch (error) {
      console.error('Error fetching institutes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this institute?')) return;

    try {
      await instituteAPI.delete(id);
      setInstitutes(institutes.filter(inst => inst._id !== id));
    } catch (error) {
      console.error('Error deleting institute:', error);
      alert('Failed to delete institute');
    }
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
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Institutes</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Manage educational institutes</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/institutes/dashboard')}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-xs sm:text-sm font-medium flex items-center justify-center gap-2 tap-target"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-xs sm:text-sm font-medium flex items-center justify-center gap-2 tap-target"
          >
            <Plus className="w-4 h-4" />
            <span>Add Institute</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institute
                </th>
                <th className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {institutes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-gray-500 font-medium">No institutes found</p>
                      <p className="text-gray-400 text-sm mt-1">Get started by adding your first institute</p>
                    </div>
                  </td>
                </tr>
              ) : (
                institutes.map((institute) => (
                  <tr key={institute._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-4 md:px-6 py-4">
                      <div className="flex items-center min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div 
                            className="text-xs sm:text-sm font-medium text-gray-900 hover:text-orange-500 cursor-pointer truncate tap-target"
                            onClick={() => navigate(`/institutes/${institute._id}/analytics`)}
                          >
                            {institute.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">{institute.description || 'No description'}</div>
                          <div className="md:hidden mt-1 text-xs text-gray-500 font-mono truncate">{institute.domain}</div>
                          <div className="lg:hidden mt-1">
                            <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-mono text-gray-900">{institute.domain}</span>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-4">
                      <div className="text-xs sm:text-sm text-gray-900 truncate">
                        {institute.admin?.firstName} {institute.admin?.lastName}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">{institute.admin?.email}</div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => navigate(`/institutes/${institute._id}/analytics`)}
                          className="text-gray-400 hover:text-blue-600 p-1 tap-target"
                          title="Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSettingsInstitute(institute)}
                          className="text-gray-400 hover:text-gray-600 p-1 tap-target"
                          title="Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingInstitute(institute)}
                          className="text-gray-400 hover:text-orange-500 p-1 tap-target"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(institute._id)}
                          className="text-gray-400 hover:text-red-500 p-1 tap-target"
                          title="Delete"
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

      {showAddModal && (
        <AddInstituteModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchInstitutes();
          }}
        />
      )}

      {editingInstitute && (
        <EditInstituteModal
          institute={editingInstitute}
          onClose={() => setEditingInstitute(null)}
          onSuccess={() => {
            setEditingInstitute(null);
            fetchInstitutes();
          }}
        />
      )}

      {settingsInstitute && (
        <InstituteSettingsModal
          institute={settingsInstitute}
          onClose={() => setSettingsInstitute(null)}
          onSuccess={() => {
            setSettingsInstitute(null);
            fetchInstitutes();
          }}
        />
      )}
    </div>
  );
};

export default InstitutesPage;
