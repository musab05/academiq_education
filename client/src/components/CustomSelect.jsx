import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder = 'Select...', label, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-orange-50 transition-colors ${
                value === option.value ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              {value === option.value && <Check className="w-5 h-5 text-orange-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
