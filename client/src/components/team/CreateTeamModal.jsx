import React, { useState } from 'react';
import { X, Users, FileText } from 'lucide-react';

const CreateTeamModal = ({ isOpen, onClose, onCreateTeam, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreateTeam(formData);
    setFormData({ name: '', description: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create Team</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter team name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="Team description (optional)"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors tap-target text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 sm:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors tap-target text-sm sm:text-base"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;