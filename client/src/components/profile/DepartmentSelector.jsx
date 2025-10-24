import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const DepartmentSelector = ({ departments, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedDept = departments.find(d => d._id === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex items-center justify-between bg-white"
      >
        <span className={selectedDept ? 'text-gray-900' : 'text-gray-400'}>
          {selectedDept ? `${selectedDept.name} (${selectedDept.code})` : 'Select Department'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="px-3 py-2 hover:bg-orange-50 cursor-pointer flex items-center justify-between"
          >
            <span className="text-gray-400">Select Department</span>
            {!value && <Check className="w-4 h-4 text-[#FF5A00]" />}
          </div>
          {departments.map((dept) => (
            <div
              key={dept._id}
              onClick={() => {
                onChange(dept._id);
                setIsOpen(false);
              }}
              className="px-3 py-2 hover:bg-orange-50 cursor-pointer flex items-center justify-between"
            >
              <span className="text-gray-900">{dept.name} ({dept.code})</span>
              {value === dept._id && <Check className="w-4 h-4 text-[#FF5A00]" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentSelector;
