import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Tag, Check, X } from 'lucide-react';
import { categoriesAPI } from '../../services/api';

const CategorySelector = ({ 
  selected, 
  onSelect, 
  placeholder = "Select Category",
  disabled = false,
  className = "",
  allowClear = true,
  multiple = false
}) => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.list();
      setCategories(response.data.flat || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategories = multiple 
    ? categories.filter(cat => Array.isArray(selected) ? selected.includes(cat._id) : false)
    : categories.find(cat => cat._id === selected);
  
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (categoryId) => {
    if (multiple) {
      const currentSelected = Array.isArray(selected) ? selected : [];
      const newSelected = currentSelected.includes(categoryId)
        ? currentSelected.filter(id => id !== categoryId)
        : [...currentSelected, categoryId];
      onSelect(newSelected);
    } else {
      onSelect(categoryId);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(multiple ? [] : '');
  };

  const getDisplayText = () => {
    if (multiple) {
      if (!Array.isArray(selected) || selected.length === 0) return placeholder;
      if (selected.length === 1) {
        const category = categories.find(cat => cat._id === selected[0]);
        return category?.name || placeholder;
      }
      return `${selected.length} categories selected`;
    } else {
      return selectedCategories?.name || placeholder;
    }
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
            <Tag className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className={`truncate ${(multiple ? selected?.length > 0 : selected) ? 'text-gray-900' : 'text-gray-500'}`}>
              {getDisplayText()}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {allowClear && (multiple ? selected?.length > 0 : selected) && !disabled && (
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
              placeholder="Search categories..."
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
                <span className="text-sm mt-2 block">Loading categories...</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Tag className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <span className="text-sm">
                  {searchTerm ? 'No categories found' : 'No categories available'}
                </span>
              </div>
            ) : (
              <div className="py-1">
                {allowClear && (
                  <button
                    onClick={() => multiple ? handleSelect([]) : handleSelect('')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                      (multiple ? selected?.length === 0 : !selected) ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {(multiple ? selected?.length === 0 : !selected) && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium">No Category</span>
                  </button>
                )}
                {filteredCategories.map((category) => {
                  const isSelected = multiple 
                    ? Array.isArray(selected) && selected.includes(category._id)
                    : selected === category._id;
                  
                  return (
                    <button
                      key={category._id}
                      onClick={() => handleSelect(category._id)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        isSelected ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-400 truncate mt-1">{category.description}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
