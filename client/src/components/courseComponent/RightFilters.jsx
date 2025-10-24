import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import CategorySelector from '../course/CategorySelector';



const RightFilters = ({ onFiltersChange, resetTrigger }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);



  useEffect(() => {
    console.log('RightFilters - Filters changed:', {
      categories: selectedCategories,
      levels: selectedLevels,
      ratings: selectedRatings,
      price: selectedPrice
    });
    onFiltersChange?.({ 
      categories: selectedCategories, 
      levels: selectedLevels,
      ratings: selectedRatings,
      price: selectedPrice
    });
  }, [selectedCategories, selectedLevels, selectedRatings, selectedPrice]);

  useEffect(() => {
    if (resetTrigger > 0) {
      setSelectedCategories([]);
      setSelectedLevels([]);
      setSelectedRatings([]);
      setSelectedPrice([]);
    }
  }, [resetTrigger]);

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
  };

  return (
    <div className="bg-white border-0 lg:border lg:border-gray-100 p-4 sm:p-6 lg:sticky lg:top-6">
      <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4">Course Category</h4>

      <CategorySelector
        categories={categories}
        selected={selectedCategories}
        onSelect={handleCategorySelect}
      />

      <hr className="my-4 sm:my-6" />

      <h4 className="font-semibold text-gray-900 mb-3">Price</h4>
      <div className="space-y-2 sm:space-y-3 text-sm text-gray-700">
        {[{ key: 'free', label: 'Free' }, { key: 'paid', label: 'Paid' }].map((p) => (
          <label key={p.key} className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              checked={selectedPrice.includes(p.key)}
              onChange={(e) => {
                const newPrice = e.target.checked 
                  ? [...selectedPrice, p.key]
                  : selectedPrice.filter(price => price !== p.key);
                setSelectedPrice(newPrice);
              }}
            />
            <span>{p.label}</span>
          </label>
        ))}
      </div>

      <hr className="my-4 sm:my-6" />

      <h4 className="font-semibold text-gray-900 mb-3">Review</h4>
      <div className="space-y-2 sm:space-y-3 text-sm text-gray-700">
        {[5, 4, 3, 2, 1].map((rating) => (
          <label key={rating} className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              checked={selectedRatings.includes(rating)}
              onChange={(e) => {
                console.log('Rating checkbox clicked:', rating, 'checked:', e.target.checked);
                const newRatings = e.target.checked 
                  ? [...selectedRatings, rating]
                  : selectedRatings.filter(r => r !== rating);
                console.log('New ratings array:', newRatings);
                setSelectedRatings(newRatings);
              }}
            />
            <div className="flex items-center gap-1">
              {Array.from({ length: rating }).map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
          </label>
        ))}
      </div>

      <hr className="my-4 sm:my-6" />

      <h4 className="font-semibold text-gray-900 mb-3">Level</h4>
      <div className="space-y-2 sm:space-y-3 text-sm text-gray-700">
        {[{ key: 'beginner', label: 'Beginner' }, { key: 'intermediate', label: 'Intermediate' }, { key: 'advanced', label: 'Advanced' }].map((l) => (
          <label key={l.key} className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              checked={selectedLevels.includes(l.key)}
              onChange={(e) => {
                const newLevels = e.target.checked 
                  ? [...selectedLevels, l.key]
                  : selectedLevels.filter(level => level !== l.key);
                setSelectedLevels(newLevels);
              }}
            />
            <span>{l.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default RightFilters;
