import React, { useState } from 'react';
import { X, Search, User, Crown } from 'lucide-react';

const AddMemberModal = ({ isOpen, onClose, availableUsers, onAddMember, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');

  const filteredUsers = availableUsers.filter(user =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = (userId) => {
    onAddMember(userId, selectedRole);
    setSearchQuery('');
    setSelectedRole('member');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add Team Member</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedRole('member')}
                className={`flex-1 px-3 py-2 rounded-lg border text-xs sm:text-sm flex items-center justify-center gap-2 tap-target ${
                  selectedRole === 'member' 
                    ? 'bg-orange-50 border-orange-200 text-orange-700' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                Member
              </button>
              <button
                onClick={() => setSelectedRole('manager')}
                className={`flex-1 px-3 py-2 rounded-lg border text-xs sm:text-sm flex items-center justify-center gap-2 tap-target ${
                  selectedRole === 'manager' 
                    ? 'bg-orange-50 border-orange-200 text-orange-700' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Crown className="w-4 h-4" />
                Manager
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
                No users available
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user._id}
                  className="flex items-center justify-between gap-2 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user._id)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-orange-500 text-white text-xs sm:text-sm rounded hover:bg-orange-600 disabled:opacity-50 tap-target flex-shrink-0"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;