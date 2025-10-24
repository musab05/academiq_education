import React, { useState, useEffect } from 'react';
import { X, Building, FileText, Hash } from 'lucide-react';
import DepartmentParentSelector from './DepartmentParentSelector';
import UserSelector from './UserSelector';

const CreateDepartmentModal = ({ isOpen, onClose, onCreateDepartment, loading, users = [], departments = [], department = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    headId: '',
    parent: 'All'
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
        code: department.code || '',
        headId: department.head?._id || '',
        parent: department.parent?._id || 'All'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        code: '',
        headId: '',
        parent: 'All'
      });
    }
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreateDepartment(formData);
    setFormData({ name: '', description: '', code: '', headId: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-2">{department ? 'Edit Department' : 'Create Department'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 tap-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Department Name *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter department name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Department Code *
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                placeholder="e.g., CS, ENG, MATH"
                maxLength={10}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Parent Department
            </label>
            <DepartmentParentSelector
              departments={departments}
              selected={formData.parent}
              onSelect={(value) => setFormData(prev => ({ ...prev, parent: value }))}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Department Head
            </label>
            <UserSelector
              users={users}
              selected={formData.headId}
              onSelect={(value) => setFormData(prev => ({ ...prev, headId: value }))}
              placeholder="Select department head (optional)"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="Department description (optional)"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base tap-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm sm:text-base tap-target"
            >
              {loading ? (department ? 'Updating...' : 'Creating...') : (department ? 'Update Department' : 'Create Department')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDepartmentModal;