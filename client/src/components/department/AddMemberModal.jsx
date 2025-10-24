import React, { useState } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';
import UserSelector from './UserSelector';

const AddMemberModal = ({ isOpen, onClose, availableUsers, onAddMember, loading }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    await onAddMember(selectedUser, selectedRole);
    setSelectedUser('');
    setSelectedRole('member');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add Member</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Select User *
            </label>
            <UserSelector
              users={availableUsers}
              selected={selectedUser}
              onSelect={setSelectedUser}
              placeholder="Choose a user"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Role *
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="member">Member</option>
                <option value="coordinator">Coordinator</option>
              </select>
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
              disabled={loading || !selectedUser}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base tap-target"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;