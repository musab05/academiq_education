import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Building, Check, X } from 'lucide-react';
import { departmentAPI } from '../../services/api';

const DepartmentSelector = ({ 
  selected, 
  onSelect, 
  placeholder = "Select Department",
  disabled = false,
  className = "",
  allowClear = true,
  showCode = true
}) => {
  const [departments, setDepartments] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data.flat || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedDepartment = departments.find(dept => dept._id === selected);
  
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.code && dept.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (departmentId) => {
    onSelect(departmentId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect('');
  };

  const formatDepartmentLabel = (dept) => {
    if (!dept) return '';
    return showCode && dept.code ? `${dept.name} (${dept.code})` : dept.name;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 border rounded-lg cursor-pointer transition-all duration-200
          ${disabled 
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500' 
            : isOpen 
              ? 'border-orange-500 ring-2 ring-orange-500 ring-opacity-20 bg-white' 
              : 'border-gray-300 hover:border-orange-400 bg-white'
          }
          ${isOpen ? 'rounded-b-none' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Building className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className={`truncate ${selectedDepartment ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedDepartment ? formatDepartmentLabel(selectedDepartment) : placeholder}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {allowClear && selected && !disabled && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                type="button"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              autoFocus
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                <span className="text-sm mt-2 block">Loading departments...</span>
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Building className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <span className="text-sm">
                  {searchTerm ? 'No departments found' : 'No departments available'}
                </span>
              </div>
            ) : (
              <div className="py-1">
                {allowClear && (
                  <button
                    onClick={() => handleSelect('')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                      !selected ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {!selected && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium">No Department</span>
                  </button>
                )}
                {filteredDepartments.map((dept) => (
                  <button
                    key={dept._id}
                    onClick={() => handleSelect(dept._id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                      selected === dept._id ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {selected === dept._id && <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{dept.name}</div>
                      {dept.code && (
                        <div className="text-xs text-gray-500 truncate">Code: {dept.code}</div>
                      )}
                      {dept.description && (
                        <div className="text-xs text-gray-400 truncate mt-1">{dept.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentSelector;
