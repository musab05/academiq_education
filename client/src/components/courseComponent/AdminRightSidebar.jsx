import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import CategorySelector from '../course/CategorySelector';



const AdminRightSidebar = ({ onFiltersChange }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.list();
      setCategories(response.data.flat || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategorySelect = (newSelectedCategories) => {
    setSelectedCategories(newSelectedCategories);
    onFiltersChange?.({ categories: newSelectedCategories, levels: selectedLevels });
  };

  return (
    <div className="bg-white lg:rounded-xl lg:border lg:border-gray-100 p-4 sm:p-6 lg:sticky">
      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Categories</h4>
      
      <CategorySelector
        categories={categories}
        selected={selectedCategories}
        onSelect={handleCategorySelect}
      />

      <hr className="my-4 sm:my-6" />

      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Level</h4>
      <div className="space-y-2 sm:space-y-3 text-sm text-gray-700">
        {[{ key: 'beginner', label: 'Beginner' }, { key: 'intermediate', label: 'Intermediate' }, { key: 'advanced', label: 'Advanced' }].map((l) => (
          <label key={l.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 tap-target"
                checked={selectedLevels.includes(l.key)}
                onChange={(e) => {
                  const newLevels = e.target.checked 
                    ? [...selectedLevels, l.key]
                    : selectedLevels.filter(level => level !== l.key);
                  setSelectedLevels(newLevels);
                  onFiltersChange?.({ categories: selectedCategories, levels: newLevels });
                }}
              />
              <span>{l.label}</span>
            </div>
            <span className="text-gray-400 text-xs">15</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default AdminRightSidebar;