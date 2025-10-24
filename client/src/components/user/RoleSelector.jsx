import React, { useState } from 'react';
import { ChevronDown, User, GraduationCap, Shield, Crown } from 'lucide-react';

const roleIcons = {
  student: <User className="w-4 h-4" />,
  instructor: <GraduationCap className="w-4 h-4" />,
  admin: <Shield className="w-4 h-4" />,
  superadmin: <Crown className="w-4 h-4" />
};

const roleLabels = {
  student: 'Student',
  instructor: 'Instructor', 
  admin: 'Admin',
  superadmin: 'Super Admin'
};

const RoleSelector = ({ selected, onSelect, availableRoles, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-left flex items-center justify-between ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          {selected && roleIcons[selected]}
          <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
            {selected ? roleLabels[selected] : 'Select role...'}
          </span>
        </div>
        {!disabled && <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {availableRoles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                onSelect(role);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
            >
              {roleIcons[role]}
              <span>{roleLabels[role]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleSelector;