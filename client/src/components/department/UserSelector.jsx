import React, { useState, useMemo } from 'react';
import { ChevronDown, User, Crown, Shield } from 'lucide-react';

const UserSelector = ({ users = [], selected, onSelect, placeholder = "Select user" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(user => 
      user.firstName.toLowerCase().includes(q) ||
      user.lastName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    );
  }, [query, users]);

  const selectedUser = useMemo(() => {
    return users.find(user => user._id === selected);
  }, [users, selected]);

  const getRoleIcon = (role) => {
    if (role === 'superadmin') return <Crown className="w-4 h-4 text-yellow-500" />;
    if (role === 'admin') return <Shield className="w-4 h-4 text-blue-500" />;
    return <User className="w-4 h-4 text-gray-500" />;
  };

  const getRoleBadge = (role) => {
    const colors = {
      superadmin: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-blue-100 text-blue-800',
      instructor: 'bg-green-100 text-green-800',
      student: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
      >
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-400" />
          {selectedUser ? (
            <span>{selectedUser.firstName} {selectedUser.lastName}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="max-h-60 overflow-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div
              onClick={() => {
                onSelect('');
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              <span className="text-sm text-gray-500">{placeholder}</span>
            </div>
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => {
                  onSelect(user._id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer ${selected === user._id ? 'bg-orange-50' : ''}`}
              >
                {getRoleIcon(user.role)}
                <div className="flex-1">
                  <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default UserSelector;